Meteor.startup(function () {
    Drivers.start();
    Sensors.scanForUnknownSensorStatuses();
})