Template.cronEntryTableField.helpers({
    text : function() {
        if(this.cron!==undefined) {
            return CronExpression.getCronDescription(this.cron[0]) + ' ' + (this.cron.length > 1 ? ' and more...' : '');
        }
        else {
            return 'Once '+DateUtils.getAtDateString(this.executeOn,true);
        }
    }
});
