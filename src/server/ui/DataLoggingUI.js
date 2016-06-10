Meteor.methods({
    DataLoggingUI_getSensorData : function(sensorId,since) {
        return DataLoggerInstance.fetchData(sensorId,since);
    },

    DataLoggingUI_clearData:function() {
        DataLoggerInstance.clearDataLog();
    }
});