Collections.Settings = new Mongo.Collection("settings");
Collections.Settings.SETTINGS_DOCUMENT_ID='settings';

Schemas.Settings=new SimpleSchema({
    /* event logging */
    enableEventLogging: {
        label:'Enable Event Logging (affects performance)',
        optional:true,
        defaultValue:true,
        type: Boolean
    },
    logCapacity: {
        label:'Log Capacity (messages)',
        optional:true,
        min:10,
        max:10000,
        defaultValue:3000,
        type: Number
    },
    /* data logging */
    dataLoggingEnabled: {
        label:'Enable Data Logging',
        optional:true,
        defaultValue:true,
        type: Boolean
    },
    persistenceInterval: {
        label:'Persistence Interval (seconds)',
        optional:true,
        defaultValue:10*60,
        min:1,
        max:24*60,
        type: Number
    },
    dataLoggingHistory: {
        label:'Stored History (days)',
        optional:true,
        defaultValue:365,
        min:31,
        max:365*3,
        type: Number
    },
    minimumIntervalBetweenSensorUpdates: {
        label:'Minimum Interval Between Sensor Updates (seconds)',
        optional:true,
        defaultValue:10,
        min:5,
        max:3600,
        type: Number
    },
    /* security */
    anonymousAccessToDashboards: {
        label:'Allow Anonymous Access to Dashboards',
        optional:true,
        defaultValue:true,
        type: Boolean
    },
    selfRegistration: {
        label:'Allow Self-Registration (users may create an account on their own)',
        optional:true,
        defaultValue:true,
        type: Boolean
    }
});

Collections.Settings.attachSchema(Schemas.Settings);