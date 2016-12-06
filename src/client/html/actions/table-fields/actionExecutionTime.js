Template.actionExecutionTime.helpers({
    lastRun: function() {
        if ((typeof this.actionStatus)!=='undefined') return DateUtils.getDateString(this.actionStatus.lastRun); else return "Unknown";
    }
});

Template.actionExecutionTime.events({
    'click .button' : function() {
        ConnectionManager.call('startAction',this.action._id);
    }
});
