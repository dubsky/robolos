class SensorsClass {

    constructor() {
        this.knownSensors = {};
        this.sensorValueListeners = {
            listenerObjects: [],
            idGenerator: 0
        };
    }

    /** enhance sensor from driver with extra fields */
    processSensorFromDriver(sensorId, result, driverInstance) {
        var type = SensorTypes[result.type];
        if ((typeof type) === 'undefined') {
            log.error('unknown class:', result);
            result.class = SensorClasses.UNKNOWN;
        }
        else {
            result.class = type.class;
            result.comment = type.comment;
        }
        result.driver = driverInstance.getId();
        result._id = sensorId;
        return result;
    }


    sensorsDiscovered(driverInstance, sensors) {
        try {
            for (var i in sensors) {
                var sensor = sensors[i];
                let sensorId = SHARED.getSensorID(driverInstance.getId(), sensor.deviceId, sensor.sensorId);
                var notPreviouslyKnown = this.knownSensors[sensorId] === undefined;
                this.knownSensors[sensorId] = sensor;

                var result = this.processSensorFromDriver(sensorId, sensor, driverInstance);

                // fire update/add event first
                if (notPreviouslyKnown) {
                    SensorsUI.fireCreateEvent(result);
                }
                else {
                    SensorsUI.fireUpdateEvent(result);
                }
                // pre-process the initial value (according to meta)
                result.value = this.processIncomingSensorValueForSensorObject(driverInstance, result, result.value);

                // ask for system state after boot
                if ((result.class === SensorClasses.ANALOG_OUTPUT || result.class === SensorClasses.BINARY_OUTPUT || result.class === SensorClasses.ANALOG_OUTPUT_0_100) && (typeof result.value) === 'undefined') {
                    driverInstance.getDriver().performAction(result.deviceId, result.sensorId, SENSOR_ACTIONS.GET_VALUE);
                }
            }
        }
        catch (e) {
            log.error('Failed to load data from a driver', e);
            SHARED.printStackTrace(e);
        }
    }


    /**
     * List of Sensors
     */
    forEachSensor(f) {
        var knownSensors = this.knownSensors;
        for (let i in knownSensors) {
            if (knownSensors.hasOwnProperty(i)) f(knownSensors[i]);
        }
    }

    /**
     * Ask for sensors where we don't have values for - perhaps there are not connected during discovery, etc.
     */
    scanForUnknownSensorStatuses() {
        var self = this;
        var fn = function () {
            var keys = Object.keys(self.knownSensors);
            var i = 0;
            var handle = setInterval(function () {
                var s = self.knownSensors[keys[i++]];
                if ((s !== undefined) && (s.class === SensorClasses.ANALOG_OUTPUT || s.class === SensorClasses.BINARY_OUTPUT || s.class === SensorClasses.ANALOG_OUTPUT_0_100) && (typeof s.value) === 'undefined') {
                    self.getDriverByInstanceID(s.driver).performAction(s.deviceId, s.sensorId, SENSOR_ACTIONS.GET_VALUE);
                }
                if (i == keys.length) {
                    clearInterval(handle);
                    //log.debug('done - rescan in 10s');
                    setTimeout(fn, 20000);
                }
            }, 300);
        };
        setTimeout(fn, 10000);
    }

    getSensorStatus(driverInstance, device, sensor) {
        var fromCache = this.knownSensors[SHARED.getSensorID(driverInstance, device, sensor)];
        if ((typeof fromCache) === 'undefined') return fromCache;
        if ((typeof fromCache.value) === 'undefined') {
            var driver = Devices.getDriverByInstanceID(driverInstance);
            if ((typeof driver) !== 'undefined')
                driver.performAction(device, sensor, SENSOR_ACTIONS.GET_VALUE);
        }
        return fromCache;
    }


    performAction(driverInstanceId, deviceId, sensorId, action, parameters) {

        var driver = Devices.getDriverByInstanceID(driverInstanceId);
        if (driver === undefined) return;

        if (action === SENSOR_ACTIONS.SWITCH_OVER) {
            var status = this.getSensorStatus(driverInstanceId, deviceId, sensorId);
            if ((typeof status) === 'undefined') {
                log.error('sensor ' + SHARED.getSensorID(driverInstanceId, deviceId, sensorId) + ' is not available to the runtime right now');
                return;
            }
            if (status.value === 0) {
                this.performAction(driverInstanceId, deviceId, sensorId, SENSOR_ACTIONS.SWITCH_ON);
            }
            else {
                this.performAction(driverInstanceId, deviceId, sensorId, SENSOR_ACTIONS.SWITCH_OFF);
            }
        }
        else {

            var status = this.getSensorStatus(driverInstanceId, deviceId, sensorId);
            if (status === undefined) {
                log.error('sensor ' + SHARED.getSensorID(driverInstanceId, deviceId, sensorId) + ' is not available to the runtime right now');
                return;
            }

            if (action === SENSOR_ACTIONS.SWITCH_ON || action === SENSOR_ACTIONS.SWITCH_OFF) {

                log.event(
                    function(context) {
                        let action = SENSOR_ACTIONS.SWITCH_ON ? 'Switch on' : 'Switch off';
                        return [action+' \''+SensorsClass.getName(context)+'\'',context.keywords];
                    },
                    status
                );

                if (status.class === SensorClasses.BINARY_OUTPUT) {
                    if (this.shouldReverseLogic(driverInstanceId, deviceId, sensorId)) {
                        if (action === SENSOR_ACTIONS.SWITCH_ON)
                            return driver.performAction(deviceId, sensorId, SENSOR_ACTIONS.SWITCH_OFF, parameters);
                        else
                            return driver.performAction(deviceId, sensorId, SENSOR_ACTIONS.SWITCH_ON, parameters);

                    }
                    else {
                        return driver.performAction(deviceId, sensorId, action, parameters);
                    }
                }
                if (status.class === SensorClasses.ANALOG_OUTPUT_0_100) {
                    if (action === SENSOR_ACTIONS.SWITCH_ON) {
                        var value = status.switchOffValue === undefined ? 100 : status.switchOffValue;
                        return driver.performAction(deviceId, sensorId, SENSOR_ACTIONS.SET_VALUE, value);

                    }
                    else {
                        status.switchOffValue = status.value;
                        return driver.performAction(deviceId, sensorId, SENSOR_ACTIONS.SET_VALUE, 0);
                    }
                }
            }
            else {
                log.event(
                    function(context) {
                        let action = action;
                        return [action+' \''+SensorsClass.getName(context)+'\' parameters:'+parameters,context.keywords];
                    },
                    status
                );
                return driver.performAction(deviceId, sensorId, action, parameters);
            }
        }
    }

    shouldReverseLogic(driverInstanceId, deviceId, sensorId) {
        var meta = SensorMetadata.getSensorMetadata(SHARED.getSensorID(driverInstanceId, deviceId, sensorId));
        if (meta !== undefined) {
            return meta.reversedLogic;
        }
        return false;
    }

    invertSensorValueOnReveresedLogicChange(driverInstanceId, deviceId, sensorId) {
        var status = this.getSensorStatus(driverInstanceId, deviceId, sensorId);
        //log.debug('inverting current value',status.value);
        if (status.value === true || status.value === false) status.value = !status.value;
        if (status.value === 1 || status.value === 0) status.value ^= 1;
        for (var i in this.sensorValueListeners.listenerObjects) {
            //if(device==='My Sensors') log.debug('incoming value from mysensors:'+fromCache.value);
            //log.debug('inverting current value: distributing change to: '+status.value);
            this.sensorValueListeners.listenerObjects[i](driverInstanceId, deviceId, sensorId, status.value, new Date().getTime());
        }
    }

    adjustIncomingSensorValueAccordingToMeta(sensorObject, driverInstanceId, device, sensor, value) {
        if (sensorObject.class === SensorClasses.BINARY_INPUT || sensorObject.class === SensorClasses.BINARY_OUTPUT) {
            var shouldReverseLogic = this.shouldReverseLogic(driverInstanceId, device, sensor);
            if (shouldReverseLogic) {
                if (value === 0) return 1;
                if (value === 1) return 0;
                return +(!value);
            }
        }
        return value;
    }

    processIncomingSensorValueForSensorObject(driverInstance, sensorObject, value) {
        // log.debug('event from:'+device+';'+sensor+'  value:'+value);
        var driverInstanceId = driverInstance.getId();
        sensorObject.value = this.adjustIncomingSensorValueAccordingToMeta(sensorObject, driverInstanceId, sensorObject.deviceId, sensorObject.sensorId, value);
        sensorObject.timestamp = new Date().getTime();
        for (var i in this.sensorValueListeners.listenerObjects) {
            //if(device==='My Sensors') log.debug('incoming value from mysensors:'+fromCache.value);
            this.sensorValueListeners.listenerObjects[i](driverInstanceId, sensorObject.deviceId, sensorObject.sensorId, sensorObject.value, sensorObject.timestamp);
        }
    }

    static getName(sensorObject) {
        if(sensorObject.title==undefined) return sensorObject._id; else return sensorObject.title;
    }

    processIncomingSensorValue(driverInstance, device, sensor, value) {
        let sensorID = SHARED.getSensorID(driverInstance.getId(), device, sensor);
        var fromCache = this.knownSensors[sensorID];
        if ((typeof fromCache) === 'undefined') {
            log.error('Incoming data from unknown sensor, dropped:' + sensorID);
            return;
        }
        log.event(
            function(context) {
                return ['Sensor value change of \''+SensorsClass.getName(context[0])+'\' to \''+context[1]+'\' detected',context[0].keywords];
            },
            [fromCache,value]
        );
        this.processIncomingSensorValueForSensorObject(driverInstance, fromCache, value);
    }

    addSensorValueEventListener(listener) {
        var id = this.sensorValueListeners.idGenerator++;
        this.sensorValueListeners.listenerObjects[id] = listener;
        return id;
    }

    removeSensorValueEventListener(id) {
        delete this.sensorValueListeners.listenerObjects[id];
    }

    removeSensorOnUserRequest(id) {
        //log.debug("removing sensor id");
        delete this.knownSensors[id];
    }
}

Sensors=new SensorsClass();
