DriversCollection = CollectionManager.Collection("drivers");


Template.addDriverInstance.helpers({
    drivers: function() {
        return DriversCollection.find();
    },

    isAlreadyInstantiated: function(driver) {
        let driverInstance=Collections.DriverInstances.findOne({driver: driver.id});
        return driverInstance!=null;
    }
});

Template.addDriverInstance.events({

    'click .cancel' :function(event) {
        Router.go('driverInstances');
        return false;
    },

    'click .addDriverInstance' :function(event) {
        Router.go(event.toElement.getAttribute('driver-id')+'/create');
    }
});

Router.route('driverInstance-create', function () {
    this.render('addDriverInstance');
}, { name: 'addDriverInstance'});



