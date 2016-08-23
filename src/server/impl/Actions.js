ActionStatus = { RUNNING : 'RUN', READY:'READY', WAITING_FOR_CONDITION:'CONDITION', PAUSED: 'PAUSED', WAITING:'WAIT', SYNTAX_ERROR:'SYNTAX ERROR'};
DEPENDENCY_TYPE = { VARIABLE:'variable', SENSOR:'sensor'};

class ActionContext {

    constructor(action, actionStatus) {
        this.actionStatus=actionStatus;
        this.action=action;
    }

    fillPauseCancelAvailability(wait,onPause,onContinue,onCancel) {
        wait.pauseAvailable=onPause!==undefined && onContinue!==undefined;
        wait.cancelAvailable=onCancel!==undefined;
    }

    setTimeout(timeout, statements, onPause, onContinue, onCancel, whenDone) {
        this.actionStatus.status=ActionStatus.WAITING;
        this.actionStatus.wait={
            trigerringStatusTransition:ActionStatus.WAITING,
            since: new Date().getTime(),
            elapsedTime:0,
            duration: timeout,
            onTimeout: statements, whenDone: whenDone, onCancel: onCancel, onPause: onPause, onContinue: onContinue
        };
        this.fillPauseCancelAvailability(this.actionStatus.wait,onPause,onContinue,onCancel);
        ActionsUI.fireUpdateEvent(this.action);
        var self=this;
        this.actionStatus.wait.currentWaitHandle=Meteor.setTimeout(function() {
            self.actionStatus.status=ActionStatus.RUNNING;
            delete self.actionStatus.wait;
            statements(self,whenDone);
        },timeout);
    }

    cancelWaitForAction(onCancel) {
        if(this.actionStatus.wait.currentSensorListenerHandle!==undefined) Sensors.removeSensorValueEventListener(this.actionStatus.wait.currentSensorListenerHandle);
        if(this.actionStatus.wait.currentVariableListenerHandle!==undefined) VariablesInstance.removeEventListener(this.actionStatus.wait.currentVariableListenerHandle);
        this.actionStatus.status=ActionStatus.RUNNING;
        delete this.actionStatus.wait;
        var self=this;
        let whenDone=function() {
            self.actionStatus.status=ActionStatus.READY;
            delete self.actionStatus.message;
            ActionsUI.fireUpdateEvent(self.action);
        };

        if(onCancel!==undefined) {
            onCancel(this,function() {
                whenDone();
            });
        }
        else {
            whenDone();
        }
    }

    waitFor(timeout,condition,statements,onPause,onContinue,onCancel,whenDone) {
        // calculate the list of depending sensors/variables
        this.trackDependencies=true;
        this.variableDependencies={};
        this.sensorDependencies={};
        var conditionResult;
        switch(typeof condition) {
            case 'function':
                conditionResult=condition(this);
            case 'boolean':
                conditionResult=condition;
            default:
                conditionResult=false;
        }
        this.trackDependencies=false;

        if(conditionResult) {
            statements(this,whenDone);
        }
        else {
            if(this.sensorDependencies.notEmpty || this.variableDependencies.notEmpty) {
                var self=this;
                self.actionStatus.status=ActionStatus.WAITING_FOR_CONDITION;
                self.actionStatus.wait={
                    trigerringStatusTransition:ActionStatus.WAITING_FOR_CONDITION,
                    since: new Date().getTime(),
                    elapsedTime:0,
                    duration: timeout,
                    onCancel: onCancel, onPause: onPause, onContinue: onContinue
                };
                this.fillPauseCancelAvailability(self.actionStatus.wait,onPause,onContinue,onCancel);
                ActionsUI.fireUpdateEvent(this.action);

                this.actionStatus.wait.currentWaitHandle=Meteor.setTimeout(function() {
                   self.cancelWaitForAction(onCancel);
                },timeout);

                function onConditionFullfillment() {
                    if(self.actionStatus.wait!==undefined) {
                        Meteor.clearTimeout(self.actionStatus.wait.currentWaitHandle);
                        delete self.actionStatus.wait.currentWaitHandle;
                        self.actionStatus.status = ActionStatus.RUNNING;
                        if (self.actionStatus.wait.currentSensorListenerHandle !== undefined) Sensors.removeSensorValueEventListener(self.actionStatus.wait.currentSensorListenerHandle);
                        if (self.actionStatus.wait.currentVariableListenerHandle !== undefined) VariablesInstance.removeEventListener(self.actionStatus.wait.currentVariableListenerHandle);
                        delete self.actionStatus.wait;
                        statements(self, whenDone);
                    }
                }

                if(this.sensorDependencies.notEmpty) {
                    self.actionStatus.wait.currentSensorListenerHandle=Sensors.addSensorValueEventListener(function(driver,device,sensor,value,timestamp) {
                        if(self.actionStatus.status===ActionStatus.PAUSED) return;
                        if(self.sensorDependencies[SHARED.getSensorID(driver,device,sensor)]!==undefined)
                        {
                            if(condition(self)) onConditionFullfillment();
                        }
                    });
                }

                if(this.variableDependencies.notEmpty) {
                    this.actionStatus.wait.currentVariableListenerHandle=VariablesInstance.addEventListener(
                        {
                            onUpdate : function(variableId) {
                                if(self.actionStatus.status===ActionStatus.PAUSED) return;
                                if(self.variableDependencies[variableId])
                                {
                                    if(condition(self)) onConditionFullfillment();
                                }
                            }
                        });
                }
            }
            else {
                log.error('Wait for that doesn\'t depend on sensors/variables detected: '+this.action.title+', invoking cancel directly');
            }
        }
    }

    stopProcessing() {
        if((typeof this.currentWaitHandle)!=='undefined' && this.currentWaitHandle!==null)
            Meteor.clearTimeout(this.currentWaitHandle);
        this.actionStatus=ActionStatus.READY;
    }

    set status(message) {
        this.actionStatus.message=message;
        log.debug(message);
    }

    switchOutput(operation, sensorId, sensorName) {
        //log.debug('switchOutput '+operation);
        var id=Sensors.getSensorIdComponents(sensorId);
        Sensors.performAction(id[0],id[1],id[2],null,operation);
    }

    setValue(mode, sensorId, sensorName, value) {
        ValueSchedules.unbindSensorFromSchedules(sensorId);
        var id=Sensors.getSensorIdComponents(sensorId);
        Sensors.performAction(id[0], id[1], id[2], null, SENSOR_ACTIONS.SET_VALUE, value);
    }

    followSchedule(scheduleId, scheduleName, sensorId, sensorName) {
        //console.log('bind '+scheduleId+' : '+sensorId);
        ValueSchedules.bindSensorToSchedule(scheduleId,sensorId);
    }

    getValue(sensorId, sensorName) {
        if(this.trackDependencies) {
            this.sensorDependencies[sensorId]=true;
            this.sensorDependencies.notEmpty=true;
        }
        var id=Sensors.getSensorIdComponents(sensorId);
        var status=Sensors.getSensorStatus(id[0],id[1],id[2]);
        if((typeof status)==='undefined') return null;
        return status.value;
    }

    setVariableValue(variableId,variableName,value) {
        VariablesInstance.setValue(variableId,value,true);
    }

    getVariableValue(variableId,variableName) {
        if(this.trackDependencies) {
            this.variableDependencies[variableName]=true;
            this.sensorDependencies.notEmpty=true;
        }
        return VariablesInstance.getValue(variableId);
    }

    sendNotification(severity,urgency,subject,body) {
        NotificationsInstance.sendNotification(severity,urgency,subject,body);
    }

}

class Actions {

    constructor() {
        this.cache={};
        this.length=0;
    }

    getCount() {
        return this.length;
    }

    start() {
        var self=this;
        Collections.Actions.find().forEach(function(action) {
            self.upsertAction(action);
        });
    }

    executeOnStartupActions() {
        var self=this;
        Collections.Actions.find({executeOnStartup:true}).forEach((action) => {
            this.startAction(this.getAction(action._id));
        });
    }

    getActions() {
        return this.cache;
    }

    getAction(id) {
        return this.cache[id];
    }

    upsertAction(action) {
        if (this.cache[action._id]===undefined) this.length++;
        this.cache[action._id]=action;
    }

    removeAction(actionId) {
        this.length--;
        delete this.cache[actionId];
    }

    switchActionToSyntaxErrorState(action) {
        if(action.actionStatus.wait!==undefined) {
            if (action.actionStatus.wait.currentSensorListenerHandle !== undefined) Sensors.removeSensorValueEventListener(self.actionStatus.wait.currentSensorListenerHandle);
            if (action.actionStatus.wait.currentVariableListenerHandle !== undefined) VariablesInstance.removeEventListener(self.actionStatus.wait.currentVariableListenerHandle);
            if (action.actionStatus.wait.currentWaitHandle!== undefined) Meteor.clearTimeout(action.actionStatus.wait.currentWaitHandle);
            delete action.actionStatus.wait;
        }
        action.actionStatus.status=ActionStatus.SYNTAX_ERROR;
        delete action.actionStatus.message;
        ActionsUI.fireUpdateEvent(action);
    }

    startAction(action) {
        if(action.disabled) {
            log.event(
                function(context) {
                    return ['Disabled Action Ignored\''+context.title+'\'',context.keywords];
                },
                action
            );
            return;
        }
        log.event(
            function(context) {
                return ['Starting action \''+context.title+'\'',context.keywords];
            },
            action
        );

        var actionStatus=action.actionStatus;
        if(actionStatus===undefined) {
            try {
                actionStatus={ code: eval('('+action.code+')') };
            }
            catch(e) {
                log.error('Unable to evaluate an action.',e);
                log.error(action.code);
                actionStatus={ status : ActionStatus.SYNTAX_ERROR };
            }
            this.cache[action._id].actionStatus=actionStatus;
        }
        else {
            if (actionStatus.status===ActionStatus.RUNNING) return;
        }

        actionStatus.lastRun=new Date().getTime();

        if (actionStatus.status===ActionStatus.SYNTAX_ERROR) {
            ActionsUI.fireUpdateEvent(action);
            return;
        }

        actionStatus.status=ActionStatus.RUNNING;

        try {
            var context=new ActionContext(action,actionStatus);
            if((typeof actionStatus.code)==='function')
            {
                actionStatus.code(context,function() {
                    actionStatus.status=ActionStatus.READY;
                    delete actionStatus.message;
                    ActionsUI.fireUpdateEvent(action);
                });
            }
            else {
                throw 'action '+action.title+'is not a function';
            }
        }
        catch(e)
        {
            log.error("Unexpected error when starting action: "+action.title,e);
            this.switchActionToSyntaxErrorState(action);
        }
    }

    pauseAction(action) {
        try {
            let actionStatus = action.actionStatus;
            if (actionStatus.status===ActionStatus.WAITING || actionStatus.status===ActionStatus.WAITING_FOR_CONDITION) {
                if(actionStatus.wait.pauseAvailable) {
                    var context=new ActionContext(action,actionStatus);
                    Meteor.clearTimeout(actionStatus.wait.currentWaitHandle);
                    delete actionStatus.wait.currentWaitHandle;
                    actionStatus.wait.elapsedTime+=new Date().getTime()-actionStatus.wait.since;
                    actionStatus.status=ActionStatus.RUNNING;
                    actionStatus.wait.onPause(context,function() {
                        actionStatus.status=ActionStatus.PAUSED;
                        ActionsUI.fireUpdateEvent(action);
                    });
                }
                else {
                    log.error('This action cannot be paused.');
                }
            }
        }
        catch(e)
        {
            log.error("Unexpected error when pausing action: "+action.title,e);
            this.switchActionToSyntaxErrorState(action);
        }
}

    continueAction(action) {
        try {
            let actionStatus = action.actionStatus;
            if (actionStatus !== ActionStatus.PAUSED) {
                let context=new ActionContext(action,actionStatus);
                let now=new Date().getTime();
                if (actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING || actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING_FOR_CONDITION) {
                    actionStatus.status=ActionStatus.RUNNING;
                    actionStatus.wait.onContinue(context,function() {
                        actionStatus.status=ActionStatus.PAUSED;
                        if(actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING)
                        {
                            actionStatus.wait.since=now;
                            actionStatus.wait.currentWaitHandle=Meteor.setTimeout(function() {
                                if(actionStatus.status===ActionStatus.WAITING) // make sure that the action is in consistent state
                                {
                                    actionStatus.status=ActionStatus.RUNNING;
                                    let onTimeout=actionStatus.wait.onTimeout;
                                    let whenDone=actionStatus.wait.whenDone;
                                    delete actionStatus.message;
                                    delete actionStatus.wait;
                                    onTimeout(context,whenDone);
                                }
                            },actionStatus.wait.duration-actionStatus.wait.elapsedTime);
                            actionStatus.status=ActionStatus.WAITING;
                        }
                        else if(actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING_FOR_CONDITION)
                        {
                            srcStatus.wait.since=now;
                            actionStatus.wait.currentWaitHandle=Meteor.setTimeout(function() {
                                if(actionStatus.status===ActionStatus.WAITING_FOR_CONDITION) // make sure that the action is in consistent state
                                {
                                    context.cancelWaitForAction(actionStatus.wait.onCancel);
                                }
                            },actionStatus.wait.duration-actionStatus.wait.elapsedTime);
                            actionStatus.status=ActionStatus.WAITING_FOR_CONDITION;
                        }
                        ActionsUI.fireUpdateEvent(action);
                    });
                    ActionsUI.fireUpdateEvent(action);
                }
            }
        }
        catch(e)
        {
            log.error("Unexpected error when resuming action: "+action.title,e);
            this.switchActionToSyntaxErrorState(action);
        }
    }

    stopAction(action) {
        try {
            let actionStatus = action.actionStatus;
            if (actionStatus === undefined) return;
            var context = new ActionContext(action, actionStatus);

            if (actionStatus.wait===undefined || !actionStatus.wait.cancelAvailable) {
                log.error('This action can\'t be cancelled');
                return;
            }

            if (actionStatus.status === ActionStatus.PAUSED) {
                if (actionStatus.wait.trigerringStatusTransition === ActionStatus.WAITING) {
                    actionStatus.wait.onCancel(context, function () {
                        actionStatus.status = ActionStatus.READY;
                        delete actionStatus.message;
                        ActionsUI.fireUpdateEvent(action);
                    });
                }
                if (actionStatus.wait.trigerringStatusTransition === ActionStatus.WAITING_FOR_CONDITION) {
                    context.cancelWaitForAction(actionStatus.wait.onCancel);
                }
            }

            if (actionStatus.status === ActionStatus.WAITING) {
                Meteor.clearTimeout(actionStatus.wait.currentWaitHandle);
                delete actionStatus.wait.currentWaitHandle;
                let whenDone = function () {
                    actionStatus.status = ActionStatus.READY;
                    delete actionStatus.message;
                    ActionsUI.fireUpdateEvent(action);
                };

                if (actionStatus.wait.onCancel !== undefined) {
                    actionStatus.wait.onCancel(context, function () {
                        whenDone();
                    });
                }
                else {
                    whenDone();
                }
                return;
            }
            if (actionStatus.status === ActionStatus.WAITING_FOR_CONDITION) {
                Meteor.clearTimeout(actionStatus.wait.currentWaitHandle);
                delete actionStatus.wait.currentWaitHandle;
                context.cancelWaitForAction(actionStatus.wait.onCancel);
            }
        }

        catch (e) {
            log.error("Unexpected error when stopping action: " + action.title, e);
            this.switchActionToSyntaxErrorState(action);
        }
    }
}

ActionsInstance=new Actions();
