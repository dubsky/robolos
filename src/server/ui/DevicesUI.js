
class DevicesUIClass extends Observable {

    removeDevicesByFilterFunction(filterFunction) {
        var self=this;
        Devices.forEachDevice(function(d) {
            let remove=filterFunction(d.driver, d.id);
            if (remove) {
                try {
                    // remove corresponding sensor meta data
                    SensorsUI.removeSensorsOfDevice(d.driver,d.id);
                    self.fireRemoveEvent(d._id);
                    // remove the device/sensors from internal caches
                    Devices.removeDeviceOnUserRequest(d.driver,d.id);
                }
                catch (e) {
                    log.error('error removing device',e);
                }
            }
        });
    }


    removeDevices(deviceIdList) {
        for(var i=0;i<deviceIdList.length;i++)
        {
            var idArray=deviceIdList[i].split(';');
            var driverId=idArray[0];
            var deviceId=idArray[1];

            this.removeDevicesByFilterFunction(function(driverInstanceId,id) {
                return (driverId===driverInstanceId && deviceId==id);
            });
        }
    }
}



DevicesUI=new DevicesUIClass();


Meteor.publish('devices', function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time
    Devices.forEachDevice(function(d) {
        self.added("devices", d._id, d);
    });

    var id=DevicesUI.addEventListener(    {
            onCreate : function(device) {
                self.added("devices",device._id,device);
            },
            onRemove : function(deviceId) {
                try {
                    self.removed("devices",deviceId);
                }
                catch(e)
                {
                    log.error('Error removing device',e);
                }
            },
            onUpdate : function(device) {
                try {
                    self.changed("devices",device._id,device);
                }
                catch(e)
                {
                    log.error('Error updating device',e);
                }
            }
        }
    );

    self.onStop(function(){
        DevicesUI.removeEventListener(id);
    });

    self.ready();

});



Meteor.methods({
    deleteDevices : function(list) {
        log.debug('delete devices',list);
        DevicesUI.removeDevices(list);
    }
});