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
                    Sensors.processIncomingSensorValue(driverInstance,device, sensor, value);
                },
                onSensorDiscovery: function(sensors) {
                    Sensors.sensorsDiscovered(driverInstance,sensors);
                },
                onDeviceDiscovery: function(devices) {
                    self.devicesDiscovered(driverInstance,devices);
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


