Template.nextExecutionTableField.helpers({
    nextExecution : function() {
        if(this.nextExecutionTime===0) return 'N/A';
        return DateUtils.getDateString(this.nextExecutionTime);
    }
});
