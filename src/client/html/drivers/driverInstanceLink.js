Template.driverInstanceLink.helpers({

    collection: function() {
        return Collections.DriverInstances
    },

    schema: Schemas.DriverInstance

});


Template.driverInstanceLink.events({

    'click .editInstance' :function(event) {
        event.preventDefault();
        var instanceId=event.toElement.getAttribute('driver-instance-id');
        var item = Collections.DriverInstances.findOne({_id: instanceId });
        let driver=DriversCollection.findOne({ id:item.driver});
        Router.go(driver.managementBaseRoute+'/update',{_id: instanceId});
    }
});