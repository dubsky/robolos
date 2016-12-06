isActionRunning=function(actionData) {
    if(actionData===undefined||actionData.actionStatus===undefined) return false;
    return actionData.actionStatus.status==='RUN' || actionData.actionStatus.status==='WAIT' || actionData.actionStatus.status==='CONDITION' || actionData.actionStatus.status==='PAUSED';
};


Template.actionWidget.helpers({

    data: function () {
        var id=this.widget.action;
        var actionData=SensorStatusCollection.findOne(id);

        var lastRun;
        var isRunning;
        var message;
        var wait;
        var paused;

        if(actionData===undefined||actionData.actionStatus===undefined) {
            lastRun="Unknown";
            isRunning=false;
            message='';
        }
        else
        {
            wait=actionData.actionStatus.wait;
            lastRun=DateUtils.getDateString(actionData.actionStatus.lastRun);
            isRunning=isActionRunning(actionData);
            paused=actionData.actionStatus.status==='PAUSED';
            message=actionData.actionStatus.message;
        }

        return {
            widget:this,
            wait:wait,
            lastRun:lastRun,
            isRunning:isRunning,
            paused:paused,
            actionClass: paused ? 'resumeAction' : 'pauseAction',
            message:message,
            icon: Template.widgetIconSelector.getURLPathForImageID(this.widget.icon)
        };
    },

});


Template.actionWidget.idGenerator=0;


Template.actionWidget.stop=function(action) {
    $('.popup').hide();
    $('.popup').remove();
    // the above is an ugly workaround
    //$('.actionControl').hide();
    if (!Session.get(DASHBOARD_EDIT_MODE)) {
        ConnectionManager.call('stopAction',action);
    }
};

Template.actionWidget.continue=function(action) {
    $('.popup').hide();
    $('.popup').remove();
    // the above is an ugly workaround
    //$('.actionControl').hide();
    if (!Session.get(DASHBOARD_EDIT_MODE)) {
        ConnectionManager.call('continueAction',action);
    }
};


var openPopup=function(e,data) {
    if (!Session.get(DASHBOARD_EDIT_MODE)) {
        var target = $(e.currentTarget);
        var template = Blaze.toHTMLWithData(Template.actionStateControl, {
                data: data,
                id: Template.actionWidget.idGenerator++
            }
        );
        $(target).popup({
            position: 'top left',
            hoverable: true,
            on:'click',
            //variation: 'very wide',
            html: template
        });
        $(target).popup('show');
    }
};

Template.actionWidget.events({
    'click .button' : function(e) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            $(e.toElement).transition('pulse');
            ConnectionManager.call('startAction', this.widget.widget.action);
        }
    },

    'click .pauseAction' : function(e) {
        if(this.wait.pauseAvailable) {
            if (!Session.get(DASHBOARD_EDIT_MODE)) {
                ConnectionManager.call('pauseAction',this.widget.widget.action);
            }
        }
        else if (this.wait.cancelAvailable) {
            openPopup(e,this);
        }
    },

    'click .openResumeMenu' : function(e) {
        openPopup(e,this);
    }

});
