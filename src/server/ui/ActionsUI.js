


class ActionsUIClass extends Observable {

    /** Strip server side only information */
    cleanAction(action,withCode) {
        var mergeTarget = {};
        // some things should not be exposed to client
        for (var attrname in action) { ``
            switch(attrname) {
                case 'onCancel':
                case 'code':
                    break;
                case 'xml':
                    if(withCode) mergeTarget[attrname] = action[attrname];
                    break;
                case 'actionStatus':
                    var srcStatus=action[attrname];
                    var targetStatus=mergeTarget.actionStatus = { status: srcStatus.status,lastRun: srcStatus.lastRun, message:srcStatus.message } ;
                    if(srcStatus.wait!==undefined) {
                        targetStatus.wait={ since : srcStatus.wait.since, duration : srcStatus.wait.duration }
                    }
                    break;
                default:
                    mergeTarget[attrname] = action[attrname];
            }
        }
        return mergeTarget;
    }

}

ActionsUI=new ActionsUIClass();


Meteor.publish('actions', function(filter,reactive){
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
                self.changed("actions",action._id, action);
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

Meteor.methods({
    startAction: function(actionId) {
        var action=ActionsInstance.getAction(actionId);
        if((typeof action)==='undefined') {
            log.error('unknown action:'+actionId);
        }
        else {
            ActionsInstance.startAction(action);
        }
    },

    stopAction: function(actionId) {
        var action=ActionsInstance.getAction(actionId);
        if((typeof action)==='undefined') {
            log.error('unknown action:'+actionId);
        }
        else {
            ActionsInstance.stopAction(action);
        }
    },

    createAction: function(action) {
        var id=Collections.Actions.upsert('',action).insertedId;
        var updatedAction=Collections.Actions.findOne(id);
        ActionsInstance.upsertAction(updatedAction);
        ActionsUI.fireCreateEvent(updatedAction);
        return id;
    },

    deleteAction: function(actionId) {
        Collections.Actions.remove({_id:actionId});
        ActionsInstance.removeAction(actionId);
        ActionsUI.fireRemoveEvent(actionId);
    },

    updateAction: function(action,actionId) {
        Collections.Actions.update(actionId,action);
        var updatedAction=Collections.Actions.findOne(actionId);
        ActionsInstance.upsertAction(updatedAction);
        ActionsUI.fireUpdateEvent(updatedAction);
    }

});

