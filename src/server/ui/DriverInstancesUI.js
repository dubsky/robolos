class DriverInstancesUIClass extends Observable {

}

DriverInstancesUI=new DriverInstancesUIClass();


Meteor.publish('driverInstances', function(filter,reactive){
    Accounts.checkAdminAccess(this);

    var self = this;
    var cursor;
    if(filter==undefined) {
        cursor=Collections.DriverInstances.find();
    }
    else {
        cursor=Collections.DriverInstances.find(filter);
    }

    cursor.forEach(
        function(driverInstance) {
            self.added("driverInstances", driverInstance._id, driverInstance);
        }
    );

    self.ready();
    if(reactive!==false) {
        var id = DriverInstancesUI.addEventListener({
            onRemove: function (driverInstanceId) {
                self.removed("driverInstances", driverInstanceId);
            },

            onUpdate: function (driverInstance) {
                self.changed("driverInstances", driverInstance._id, driverInstance);
            },

            onCreate: function (driverInstance) {
                self.added("driverInstances", driverInstance._id, driverInstance);
            }
        });

        self.onStop(function () {
            DriverInstancesUI.removeEventListener(id);
        });
    }
});


Meteor.publish('drivers', function() {
    Accounts.checkAdminAccess(this);
    var self = this;
    Drivers.getDrivers().forEach(
        function(driver) {
            var iconPath=driver.getIconPath();
            if (iconPath===undefined) iconPath='/sensors/Action.png';
            self.added("drivers", driver.getDriverID(), {
                id: driver.getDriverID(),
                description: driver.getDescription(),
                allowsMultipleInstances: driver.allowsMultipleInstances(),
                iconPath:  iconPath ,
                managementBaseRoute:driver.getUIManagementBaseRoute()
            });
        });
    self.ready();
});


Meteor.methods({
    createDriverInstance: function(driverInstance) {
        Accounts.checkAdminAccess(this);
        //log.debug('data',driverInstance);
        var idNumber=0;
        var id=driverInstance.$set.driver.replace('/','-');
        var baseId=id;
        do {
            if (idNumber !== 0) id = baseId + ' ' + idNumber;
            idNumber++;
        }
        while(Collections.DriverInstances.findOne(id)!=null);
        driverInstance.$set._id=id;

        var insertedId=Collections.DriverInstances.upsert(id,driverInstance).insertedId;
        var updatedDriverInstance=Collections.DriverInstances.findOne(id);
        Drivers.startDriverInstance(updatedDriverInstance);
        DriverInstancesUI.fireCreateEvent(updatedDriverInstance);
    },

    deleteDriverInstance: function(driverInstanceId) {
        Accounts.checkAdminAccess(this);
        DevicesUI.removeDevicesByFilterFunction(function(drvInstanceId,deviceId) {
            return driverInstanceId===drvInstanceId; });
        Drivers.stopDriverInstance(driverInstanceId);
        Collections.DriverInstances.remove({_id:driverInstanceId});
        DriverInstancesUI.fireRemoveEvent(driverInstanceId);
    },

    updateDriverInstance: function(driverInstance,driverInstanceId) {
        Accounts.checkAdminAccess(this);
        Collections.DriverInstances.update(driverInstanceId,driverInstance);
        var updatedDriverInstance=Collections.DriverInstances.findOne(driverInstanceId);
        Drivers.stopDriverInstance(driverInstanceId);
        Drivers.startDriverInstance(updatedDriverInstance);
        DriverInstancesUI.fireUpdateEvent(updatedDriverInstance);
    }

});