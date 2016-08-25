Meteor.methods({
    DataLoggingUI_getSensorData : function(sensorId,since) {
        Accounts.checkAdminAccess(this);
        return DataLoggerInstance.fetchData(sensorId,since);
    },

    DataLoggingUI_clearData:function() {
        Accounts.checkAdminAccess(this);
        DataLoggerInstance.clearDataLog();
    }
});