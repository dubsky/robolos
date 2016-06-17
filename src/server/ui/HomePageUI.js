Meteor.publish("systemStatistics", function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    self.added("systemStatistics",Collections.SystemStatistics.SYSTEM_STATISTICS_ID,
        {
            actionCount: ActionsInstance.getCount(),
            scheduleCount: SchedulesInstance.getCount(),
            sensorCount: Sensors.getCount()
        }
    );
    self.ready();
});