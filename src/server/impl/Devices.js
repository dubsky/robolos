class DevicesClass {

    constructor() {
        this.knownDevices={};
    }


    /**
     * List of Devices
     */
    forEachDevice(f)
    {
        for(let i in this.knownDevices) {
            if (this.knownDevices.hasOwnProperty(i)) f(this.knownDevices[i]);
        }
    }


    devicesDiscovered(driverInstance,devices) {
        for(let i in devices) {
            var result=devices[i];
            let id=driverInstance.getId()+';'+result.id;
            result._id=id;
            result.driver=driverInstance.getId();
            if(this.knownDevices[id]===undefined)
            {
                //log.debug('discovered new device:'+id);
                this.knownDevices[id]=result;
                DevicesUI.fireCreateEvent(result);
            }
            else {
                //log.debug('re-discovered existing device:'+id,this.knownDevices[id]);
                this.knownDevices[id]=result;
                DevicesUI.fireUpdateEvent(result);
            }
        }
    }

    getDriverByInstanceID(driverInstanceId) {
        var instance=Drivers.getDriverInstance(driverInstanceId);
        if(instance===undefined) throw 'Unknown driver:'+driverInstanceId;
        return instance.getDriver();
    }

    registerDriverListener(driverInstance) {
        var self=this;
        driverInstance.getDriver().registerEventListener(
            {
                onEvent: function (device, sensor, value) {
                    if(Fiber.current!==undefined) {
                        Sensors.processIncomingSensorValue(driverInstance,device, sensor, value);
                    }
                    else {
                        Fiber(function () {
                            Sensors.processIncomingSensorValue(driverInstance,device, sensor, value);
                        }).run();
                    }
                },
                onSensorDiscovery: function(sensors) {
                    if(Fiber.current!==undefined) {
                        Sensors.sensorsDiscovered(driverInstance,sensors);
                    }
                    else {
                        Fiber(function () {
                            Sensors.sensorsDiscovered(driverInstance,sensors);
                        }).run();
                    }
                },
                onDeviceDiscovery: function(devices) {
                    if(Fiber.current!==undefined) {
                        self.devicesDiscovered(driverInstance,devices);
                    }
                    else {
                        Fiber(function () {
                            self.devicesDiscovered(driverInstance,devices);
                        }).run();
                    }
                }
            });
    }

    /** Remove device from internal caches on UI/User request */
    removeDeviceOnUserRequest(driverInstanceId,deviceId) {
        var driver=this.getDriverByInstanceID(driverInstanceId);
        driver.removeDevice(deviceId);
        Sensors.forEachSensor(function(sensor) {
            if(sensor.deviceId===deviceId && sensor.driver==driverInstanceId) Sensors.removeSensorOnUserRequest(sensor._id);
        });

        var fullDeviceId=SHARED.getDeviceID(driverInstanceId,deviceId);
        delete this.knownDevices[fullDeviceId];
        //log.debug('removing device:'+fullDeviceId);
    }

    init() {
    }
}

Devices=new DevicesClass();


