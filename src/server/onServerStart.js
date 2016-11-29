Meteor.startup(function () {

    process.on('uncaughtException', function (err) {
        log.error('Uncaught exception', err);
    });

    log.info("System is going to be initialized");
    log.info("Loading settings");
    Settings.start();
    log.info("Logging system started");
    log.start();
    log.info("Data logging initialization");
    DataLoggerInstance.start();
    log.info("Scanning stored system variables");
    VariablesInstance.start();
    log.info("Starting Notifications Processing");
    NotificationsInstance.start();
    log.info("Loading actions");
    ActionsInstance.start();
    log.info('Starting drivers');
    Drivers.start();
    log.info('Executing on startup actions');
    ActionsInstance.executeOnStartupActions();
    log.info('Sensor input processing started');
    EventsInstance.start();
    log.info("Preparing scheduled tasks");
    SchedulesInstance.start();
    log.info('Starting scan for sensor values');
    Sensors.scanForUnknownSensorStatuses();
    log.info('Initialize uploads');
    UploadsInitialization();
    log.info('Prepare keyword cache');
    KeywordsUI.start();
    log.info('Initialization Done.');
});
