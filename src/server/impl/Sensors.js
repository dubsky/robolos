import Fiber from 'fibers';

class SensorsClass {

    constructor() {
        this.knownSensors = {};
        this.sensorValueListeners = {
            listenerObjects: [],
            idGenerator: 0
        };
        this.reliabilityController=new ReliabilityController();
        this.count=0;
    }

    getCount() {
        return this.count;
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
                    this.count++;
                }
                else {
                    SensorsUI.fireUpdateEvent(result);
                }
                // pre-process the initial value (according to meta)
                if(result.value!=undefined) result.value = this.processIncomingSensorValueForSensorObject(driverInstance, result, result.value);

                // ask for system state after boot
                /*
                if ((result.class === SensorClasses.ANALOG_OUTPUT || result.class === SensorClasses.BINARY_OUTPUT || result.class === SensorClasses.ANALOG_OUTPUT_0_100) && (typeof result.value) === 'undefined') {
                    driverInstance.getDriver().performAction(result.deviceId, result.sensorId, SENSOR_ACTIONS.GET_VALUE);
                }*/
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

    getSensorIdComponents(sensorId) {
        if(sensorId!=null) {
            var id = sensorId.split(';');
            if (id.length === 3) {
                return id;
            }
            else {
                throw 'Invalid sensor id:' + sensorId;
            }
        }
        else {
            throw 'Invalid sensor id :'+sensorId;
        }
    }

    scanForUnknownSensorStatusesOneIteration() {
        //log.debug('scan started');
        if(this.scanningStatus===undefined || this.scanningStatus.keys.length==this.scanningStatus.i) {
            this.scanningStatus={ i:0, keys: Object.keys(this.knownSensors) };
        }
        let beginning=new Date().getTime();
        let numberOfScannedValues=0;
        do {
            let currentKey=this.scanningStatus.keys[this.scanningStatus.i++];
            if (this.knownSensors.hasOwnProperty(currentKey)) {
                let s = this.knownSensors[currentKey];
                if ((s !== undefined) && (s.class === SensorClasses.ANALOG_OUTPUT || s.class === SensorClasses.BINARY_OUTPUT || s.class === SensorClasses.ANALOG_OUTPUT_0_100) && (typeof s.value) === 'undefined') {
                    //log.debug('scan started '+s.driver+' '+s.deviceId+' '+s.sensorId);
                    // should be scanning for all variables !
                    let variable=Sensors.getMainVariable(s.driver,s.deviceId,s.sensorId,);
                    //log.debug('get value '+s.driver+' '+s.deviceId+' '+s.sensorId);
                    Devices.getDriverByInstanceID(s.driver).performAction(s.deviceId, s.sensorId, variable, SENSOR_ACTIONS.GET_VALUE);
                }
                if(this.scanningStatus.i>=this.scanningStatus.keys.length) break;
            }
            // don't spend more than 50ms here
            if(new Date().getTime()-beginning>50) break;
            if(numberOfScannedValues++>5) break;
        }
        while(true);
    }

    /**
     * Ask for sensors where we don't have values for - perhaps there are not connected during discovery, etc.
     */
    scanForUnknownSensorStatuses() {
        var self=this;
        var handle = Meteor.setInterval(function () {
            self.scanForUnknownSensorStatusesOneIteration();
        }, 1000);
    }

    getSensorStatus(driverInstance, device, sensor) {
        let fromCache = this.knownSensors[SHARED.getSensorID(driverInstance, device, sensor)];
        if (fromCache === undefined) return fromCache;
        /*
        if ((typeof fromCache.value) === 'undefined') {
            var driver = Devices.getDriverByInstanceID(driverInstance);
            if ((typeof driver) !== 'undefined')
                driver.performAction(device, sensor, SENSOR_ACTIONS.GET_VALUE);
        }*/
        return fromCache;
    }


    getMainVariable(driverInstanceId, deviceId, sensorId) {
        let status = this.getSensorStatus(driverInstanceId, deviceId, sensorId);
        let type=SensorTypes[status.type];
        if(type===undefined) throw 'Unknown sensor type:'+status.type;
        return type.mainVariable;
    }

    performAction(driverInstanceId, deviceId, sensorId, variable, action, parameters) {
        try {
            var driver = Devices.getDriverByInstanceID(driverInstanceId);
            var driverInstance=Drivers.getDriverInstance(driverInstanceId);

            if (driver === undefined) return;

            let chosenVariable=variable;
            if(variable===null) {
                chosenVariable=this.getMainVariable(driverInstanceId, deviceId, sensorId);
            }

            if (action === SENSOR_ACTIONS.SWITCH_OVER) {
                var status = this.getSensorStatus(driverInstanceId, deviceId, sensorId);
                console.log('switch over',status);
                if ((typeof status) === 'undefined') {
                    log.error('sensor ' + SHARED.getSensorID(driverInstanceId, deviceId, sensorId) + ' is not available to the runtime right now');
                    return;
                }
                if (status.value === 0) {
                    this.performAction(driverInstanceId, deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SWITCH_ON);
                }
                else {
                    this.performAction(driverInstanceId, deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SWITCH_OFF);
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
                            if (action === SENSOR_ACTIONS.SWITCH_ON) {
                                this.reliabilityController.onPerformAction(driverInstance,deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SWITCH_OFF, parameters);
                                return driver.performAction(deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SWITCH_OFF, parameters);
                            }
                            else
                            {
                                this.reliabilityController.onPerformAction(driverInstance,deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SWITCH_ON, parameters);
                                return driver.performAction(deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SWITCH_ON, parameters);
                            }
                        }
                        else {
                            this.reliabilityController.onPerformAction(driverInstance,deviceId, sensorId, chosenVariable, action, parameters);
                            return driver.performAction(deviceId, sensorId, chosenVariable, action, parameters);
                        }
                    }
                    if (status.class === SensorClasses.ANALOG_OUTPUT_0_100) {
                        if (action === SENSOR_ACTIONS.SWITCH_ON) {
                            let value=100;
                            this.reliabilityController.onPerformAction(driverInstance,deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SET_VALUE, value);
                            return driver.performAction(deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SET_VALUE, value);

                        }
                        else {
                            let value=0;
                            this.reliabilityController.onPerformAction(driverInstance,deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SET_VALUE,value);
                            return driver.performAction(deviceId, sensorId, chosenVariable, SENSOR_ACTIONS.SET_VALUE, value);
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
                    this.reliabilityController.onPerformAction(driverInstance,deviceId, sensorId, chosenVariable, action, parameters);
                    return driver.performAction(deviceId, sensorId, chosenVariable, action, parameters);
                }
            }
        }
        catch(e) {
            log.error('Error when performing action '+action+' on '+driverInstanceId+' '+deviceId+';'+sensorId+';'+variable+' with value'+EJSON.stringify(parameters),e);
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

    beTolerant(payload) {
        if(payload instanceof Object) {
            let keys=Object.keys(payload);
            if(keys.length>0) return payload[keys[0]];
        }
        else {
            return payload;
        }
    }

    calculateMainVariableValue(driverInstance, device,sensor,payload) {
        let sensorData=Sensors.getSensorStatus(driverInstance.getId(),device,sensor);
        if(sensorData===undefined) {
            log.error('Unknown sensor:'+driverInstance.getId()+'/'+device+'/'+sensor);
            return this.beTolerant(payload);
        }
        let clazz=SensorTypes[sensorData.type];
        if(clazz==undefined) { log.error('Unknown sensor type of '+EJSON.stringify(sensorData)); return this.beTolerant(payload); }
        let variable=clazz.mainVariable;
        if(variable==undefined) { log.error('Main variable for '+sensorData.type+' not defined'); return this.beTolerant(payload); }
        let variableValue=payload[variable.name];
        if(variableValue==undefined) { log.error('Required sensor variable '+variable.name+' for '+driverInstance.getId()+';'+device+';'+sensor +' missing, got '+EJSON.stringify(payload)+' instead'); return this.beTolerant(payload); }
        return variableValue;
    }

    /* called by the driver on sensor change */
    onEvent(driverInstance,device, sensor, value) {
        try {
            this.reliabilityController.onReceivedSensorInformation(driverInstance,device,sensor,value);
            let mainValue=this.calculateMainVariableValue(driverInstance,device,sensor,value);
            if(Fiber.current!==undefined) {
                this.processIncomingSensorValue(driverInstance,device, sensor, mainValue);
            }
            else {
                Fiber(() =>{
                    this.processIncomingSensorValue(driverInstance,device, sensor, mainValue);
                }).run();
            }
        }
        catch(e) {
            log.error('Error when processing event from '+device+';'+sensor+';'+EJSON.stringify(value),e)
        }
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
