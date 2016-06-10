Template.actionStatus.helpers({
    status: function() {
        if ((typeof this.actionStatus)!=='undefined') return this.actionStatus.status; else return "READY";
    }
});

Template.actionExecutionTime.events({
    'click .button' : function() {
        Meteor.call('startAction',this.action._id);
    }
});
