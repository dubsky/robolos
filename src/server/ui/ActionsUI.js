class ActionsUIClass extends Observable {

    /** Strip server side only information */
    cleanAction(action,withCode) {
        var mergeTarget = {};
        // some things should not be exposed to client
        for (var attrname in action) {
            switch(attrname) {
                case 'onCancel':
                case 'code':
                    break;
                case 'xml':
                    if(withCode) mergeTarget[attrname] = action[attrname];
                    break;
                case 'actionStatus':
                    var srcStatus=action[attrname];
                    var targetStatus=mergeTarget.actionStatus = { status: srcStatus.status,lastRun: srcStatus.lastRun, message:srcStatus.message, errorMessage:srcStatus.errorMessage } ;
                    if(srcStatus.wait!==undefined) {
                        targetStatus.wait={
                            since : srcStatus.wait.since,
                            duration : srcStatus.wait.duration,
                            elapsedTime: srcStatus.wait.elapsedTime,
                            pauseAvailable: srcStatus.wait.pauseAvailable,
                            cancelAvailable: srcStatus.wait.cancelAvailable
                        }
                    }
                    break;
                default:
                    mergeTarget[attrname] = action[attrname];
            }
        }
        if(mergeTarget.actionStatus===undefined) mergeTarget.actionStatus={};
        return mergeTarget;
    }

    upsertAction(id,action) {
        let insertedId=Collections.Actions.upsert(id,action).insertedId;
        let updatedAction=Collections.Actions.findOne(insertedId===undefined ? id : insertedId);
        ActionsInstance.upsertAction(updatedAction);
        if(insertedId===undefined) {
            ActionsUI.fireUpdateEvent(updatedAction);
        }
        else {
            ActionsUI.fireCreateEvent(updatedAction);
        }
        return updatedAction._id;
    }

}

ActionsUI=new ActionsUIClass();

Meteor.publish('calendarActions', function(){
    Accounts.checkDashboardAccess(this);
    return Collections.Actions.find({calendarDroppable:true}, {fields: {title: 1,description: 1,keywords: 1,calendarDroppable: 1}});
});

Meteor.publish('actions', function(filter,reactive){
    Accounts.checkAdminAccess(this);
    try {
        // safe reference to this session
        var self = this;
        // insert a record for the first time
        var actions=ActionsInstance.getActions();

        for(var a in actions) {
            let action=ActionsUI.cleanAction(actions[a],true);
            let add=true;
            if(filter!==undefined && filter._id!==undefined) add=action._id===filter._id;
            if(add) self.added("actions", action._id, action);
        }

        self.ready();
        var id=ActionsUI.addEventListener({
            onCreate : function(action) {
                self.added("actions",action._id, action);
            },
            onRemove : function(actionId) {
                self.removed("actions",actionId);
            },
            onUpdate : function(action) {
                self.changed("actions",action._id, ActionsUI.cleanAction(action,true));
            }
        });

        self.onStop(function(){
            ActionsUI.removeEventListener(id);
        });
    }
    catch(e)
    {
        log.error('subscription failed:',e);
    }
});



function performOperationOnAction(actionId,f) {
    var action=ActionsInstance.getAction(actionId);
    if(action===undefined) {
        log.error('unknown action:'+actionId);
    }
    else {
        f(action);
    }
}

Meteor.methods({
    startAction: function(actionId) {
        Accounts.checkDashboardAccess(this);
        console.log('start action',actionId);
        performOperationOnAction(actionId,(action)=> {ActionsInstance.startAction(action)});
    },
    stopAction: function(actionId) {
        Accounts.checkDashboardAccess(this);
        performOperationOnAction(actionId,(action)=> {ActionsInstance.stopAction(action)});
    },
    pauseAction: function(actionId) {
        Accounts.checkDashboardAccess(this);
        performOperationOnAction(actionId,(action)=> {ActionsInstance.pauseAction(action)});
    },
    continueAction: function(actionId) {
        Accounts.checkDashboardAccess(this);
        performOperationOnAction(actionId,(action)=> {ActionsInstance.continueAction(action)});
    },

    createAction: function(action) {
        Accounts.checkAdminAccess(this);
        let id=ActionsUI.upsertAction('',action);
        return id;
    },

    deleteAction: function(actionId) {
        Accounts.checkAdminAccess(this);
        Collections.Actions.remove({_id:actionId});
        ActionsInstance.removeAction(actionId);
        ActionsUI.fireRemoveEvent(actionId);
    },

    updateAction: function(action,actionId) {
        Accounts.checkAdminAccess(this);
        action.actionStatus=undefined;
        Collections.Actions.update(actionId,action);
        var updatedAction=Collections.Actions.findOne(actionId);
        ActionsInstance.upsertAction(updatedAction);
        ActionsUI.fireUpdateEvent(updatedAction);
    }

});

