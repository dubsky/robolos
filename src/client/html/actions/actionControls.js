Template.actionControls.helpers( {

    status(value) {
        let action=this.action;
        let actionStatus=action.actionStatus===undefined ? {} : action.actionStatus;
        let s=actionStatus.status;
        let wait=actionStatus.wait===undefined ? {} : actionStatus.wait;

        switch(value) {
            case 'READY_OR_PAUSE':
                return !(s===undefined || s===ActionStatus.READY || s===ActionStatus.SYNTAX_ERROR  || s===ActionStatus.PAUSED);
            case 'WAIT':
                return !wait.pauseAvailable || !(s===ActionStatus.WAITING || s===ActionStatus.WAITING_FOR_CONDITION);
            case 'PAUSED':
                return !wait.cancelAvailable || s!==ActionStatus.PAUSED;
            case 'ERROR':
                return s==='ERROR';
            default:
                return undefined;
        }
    },

    statusText() {
        let status=this.action.actionStatus===undefined ? 'READY' : this.action.actionStatus.status;
        switch(status) {
            case ActionStatus.WAITING:
            case ActionStatus.WAITING_FOR_CONDITION:
                return 'WAITING';
            case ActionStatus.SYNTAX_ERROR:
                return 'ERROR';
            default:
                return 'READY';
        }
    },

    errorMessage() {
        if(this.action.actionStatus!==undefined) return this.action.actionStatus.errorMessage;
    }
});

Template.actionControls.events( {
    'click .startAction': function() {
        let action=this.action;
        let s=action.actionStatus===undefined ? 'READY':action.actionStatus.status;
        if(s===undefined || s===ActionStatus.READY || s===ActionStatus.SYNTAX_ERROR) ConnectionManager.call('startAction',this.action._id);
        if(s===ActionStatus.PAUSED) ConnectionManager.call('continueAction',this.action._id);
    },
    'click .pauseAction': function() {
        ConnectionManager.call('pauseAction',this.action._id);
    },
    'click .stopAction': function() {
        ConnectionManager.call('stopAction',this.action._id);
    }

});