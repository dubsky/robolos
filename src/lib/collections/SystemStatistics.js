Collections.SystemStatistics = new Mongo.Collection("systemStatistics");
Collections.SystemStatistics.SYSTEM_STATISTICS_ID='system.statistics';

Schemas.SystemStatistics=new SimpleSchema({
    sensorCount: {
        label:'Sensor Count',
        optional:true,
        defaultValue:0,
        type: Number
    },
    scheduleCount: {
        label:'Schedule Count',
        optional:true,
        defaultValue:0,
        type: Number
    },
    actionCount: {
        label:'Action Count',
        optional:true,
        defaultValue:0,
        type: Number
    }

});

Collections.SystemStatistics.attachSchema(Schemas.SystemStatistics);