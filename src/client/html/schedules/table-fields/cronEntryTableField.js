Template.cronEntryTableField.helpers({
    text : function() {

        if(this.type=='value') {
            return '1-day Analog Value Schedule';
        }
        if(this.type=='cron') {
            return CronExpression.getCronDescription(this.cron[0]) + ' ' + (this.cron.length > 1 ? ' and more...' : '');
        }
        else {
            return 'Once '+DateUtils.getAtDateString(this.executeOn,true);
        }
    }
});
