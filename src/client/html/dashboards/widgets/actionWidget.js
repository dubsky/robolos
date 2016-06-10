Template.actionWidget.helpers({

    data: function () {
        var id=this.widget.action;
        var actionData=SensorStatusCollection.findOne(id);

        var lastRun;
        var isRunning;
        var message;
        var wait;
        if((typeof actionData)==='undefined'||(typeof actionData.actionStatus)==='undefined') {
            lastRun="Unknown";
            isRunning=false;
            message='';
        }
        else
        {
            wait=actionData.actionStatus.wait;
            lastRun=DateUtils.getDateString(actionData.actionStatus.lastRun)
            isRunning=actionData.actionStatus.status==='RUN' || actionData.actionStatus.status==='WAIT' || actionData.actionStatus.status==='CONDITION';
            message=actionData.actionStatus.message;
        }

        return {
            widget:this,
            wait:wait,
            lastRun:lastRun,
            isRunning:isRunning,
            message:message,
            icon: Template.widgetIconSelector.getURLPathForImageID(this.widget.icon)
        };
    },

});

Template.actionWidget.events({
    'click .button' : function() {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            Meteor.call('startAction', this.widget.widget.action);
        }
    },

    'click .stopAction' : function() {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            Meteor.call('stopAction',this.widget.widget.action);
        }
    }
});
