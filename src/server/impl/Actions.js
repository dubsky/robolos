ActionStatus = { RUNNING : 'RUN', READY:'READY', WAITING_FOR_CONDITION:'CONDITION', WAITING:'WAIT', SYNTAX_ERROR:'SYNTAX ERROR'};
DEPENDENCY_TYPE = { VARIABLE:'variable', SENSOR:'sensor'};

class ActionContext {

    constructor(action, actionStatus) {
        this.actionStatus=actionStatus;
        this.action=action;
    }

    setTimeout(timeout, statements, onCancel, whenDone) {
        this.actionStatus.status=ActionStatus.WAITING;
        this.actionStatus.wait={ since: new Date().getTime(), duration: timeout, onCancel: onCancel };
        ActionsUI.fireUpdateEvent(this.action);
        var self=this;
        this.actionStatus.wait.currentWaitHandle=setTimeout(function() {
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
        onCancel(this,function() {
            self.actionStatus.status=ActionStatus.READY;
            delete self.actionStatus.message;
            ActionsUI.fireUpdateEvent(self.action);
        });
    }

    waitFor(timeout,condition,statements,onCancel,whenDone) {
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
                self.actionStatus.wait={ since: new Date().getTime(), duration: timeout, onCancel: onCancel };
                ActionsUI.fireUpdateEvent(this.action);

                this.actionStatus.wait.currentWaitHandle=setTimeout(function() {
                   self.cancelWaitForAction(onCancel);
                },timeout);

                function onConditionFullfillment() {
                    if(self.actionStatus.wait!==undefined) {
                        clearTimeout(self.actionStatus.wait.currentWaitHandle);
                        self.actionStatus.status = ActionStatus.RUNNING;
                        if (self.actionStatus.wait.currentSensorListenerHandle !== undefined) Sensors.removeSensorValueEventListener(self.actionStatus.wait.currentSensorListenerHandle);
                        if (self.actionStatus.wait.currentVariableListenerHandle !== undefined) VariablesInstance.removeEventListener(self.actionStatus.wait.currentVariableListenerHandle);
                        delete self.actionStatus.wait;
                        statements(self, whenDone);
                    }
                }

                if(this.sensorDependencies.notEmpty) {
                    self.actionStatus.wait.currentSensorListenerHandle=Sensors.addSensorValueEventListener(function(driver,device,sensor,value,timestamp) {
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
            clearTimeout(this.currentWaitHandle);
        this.actionStatus=ActionStatus.READY;
    }

    set status(message) {
        this.actionStatus.message=message;
        log.debug(message);
    }

    getSensorIdComponents(sensorId) {
        if(sensorId!=null) {
            var id = sensorId.split(';');
            if (id.length === 3) {
                return id;
            }
            else {
                throw 'Invalid sensor id:' + sensorId;
            }
        }
        else {
            throw 'Invalid sensor id:'+sensorId;
        }
    }

    switchOutput(operation, sensorId, sensorName) {
        //log.debug('switchOutput '+operation);
        var id=this.getSensorIdComponents(sensorId);
        Sensors.performAction(id[0],id[1],id[2],operation);
    }

    setValue(mode, sensorId, sensorName, value) {
        var id=this.getSensorIdComponents(sensorId);
        Sensors.performAction(id[0], id[1], id[2], SENSOR_ACTIONS.SET_VALUE, value);
    }

    getValue(sensorId, sensorName) {
        if(this.trackDependencies) {
            this.sensorDependencies[sensorId]=true;
            this.sensorDependencies.notEmpty=true;
        }
        var id=this.getSensorIdComponents(sensorId);
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

    refresh() {
        var self=this;
        Collections.Actions.find().forEach(function(action) {
            self.upsertAction(action);
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

    startAction(action) {

        log.event(
            function(context) {
                return ['Starting action \''+context.title+'\'',context.keywords];
            },
            action
        );

        var actionStatus=action.actionStatus;
        if((typeof actionStatus)==='undefined') {
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
            log.error("Unexpected error when processing action: "+action.title,e);
            SHARED.printStackTrace(e);
            actionStatus.status=ActionStatus.SYNTAX_ERROR;
            delete actionStatus.message;
            ActionsUI.fireUpdateEvent(action);
        }
    }

    stopAction(action) {
        var actionStatus = action.actionStatus;
        if ((typeof actionStatus) === 'undefined') {
            return;
        }
        var context=new ActionContext(action,actionStatus);

        if (actionStatus.status===ActionStatus.WAITING) {
            clearTimeout(actionStatus.wait.currentWaitHandle);
            actionStatus.wait.onCancel(context,function() {
                actionStatus.status=ActionStatus.READY;
                delete actionStatus.message;
                ActionsUI.fireUpdateEvent(action);
            });
            return;
        }

        if (actionStatus.status===ActionStatus.WAITING_FOR_CONDITION) {
            clearTimeout(actionStatus.wait.currentWaitHandle);
            context.cancelWaitForAction(actionStatus.wait.onCancel);
        }
    }
}

ActionsInstance=new Actions();
ActionsInstance.refresh();


