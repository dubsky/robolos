Template.actionStatus.helpers({
    status: function() {
        if (this.actionStatus!==undefined) return this.actionStatus.status===undefined ? "NOT INITIALIZED" : this.actionStatus.status; else return "NOT INITIALIZED";
    }
});

Template.actionExecutionTime.events({
    'click .button' : function() {
        ConnectionManager.call('startAction',this.action._id);
    }
});
