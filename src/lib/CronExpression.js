CronExpression = {

    getCronExpression: function(cronString){
        return cronString.split(';')[0];
    },

    getCronDescription: function(cronString){
        return cronString.split(';')[1];
    },

    encode:function(cron,text) {
        return cron+';'+text;
    }

}