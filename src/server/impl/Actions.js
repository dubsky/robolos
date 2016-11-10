// TODO: merge action context and action status - it didn't show up as practical to separate those

DEPENDENCY_TYPE = { VARIABLE:'variable', SENSOR:'sensor'};

class ActionContext {

    constructor(action, actionStatus) {
        this.actionStatus=actionStatus;
        this.action=action;
    }

    forAllParentStatuses(status, fn) {
        fn(status);
        if(status.parentActionStatus!==undefined) {
            for(let parentStatus of status.parentActionStatus) this.forAllParentStatuses(parentStatus,fn);
        }
    }

    fillPauseCancelAvailability(status,onPause,onContinue,onCancel) {
        this.forAllParentStatuses(status, (st)=> {
            st.wait.pauseAvailable=onPause!==undefined && onContinue!==undefined;
            st.wait.cancelAvailable=onCancel!==undefined;
        });
    }

    setTimeout(timeout, statements, onPause, onContinue, onCancel, whenDone) {
        this.forAllParentStatuses(this.actionStatus, (status)=> {
            status.status=ActionStatus.WAITING;
            status.wait={
                trigerringStatusTransition:ActionStatus.WAITING,
                since: new Date().getTime(),
                // useful on pause (stores the time that elapsed without the pause)
                elapsedTime:0,
                duration: timeout,
            };
        });
        Object.assign(this.actionStatus.wait, { onTimeout: statements, whenDone: whenDone, onCancel: onCancel, onPause: onPause, onContinue: onContinue });
        this.fillPauseCancelAvailability(this.actionStatus,onPause,onContinue,onCancel);
        this.forAllParentStatuses(this.actionStatus, (status)=> {
            ActionsUI.fireUpdateEvent(ActionsInstance.getAction(status.actionId));
        });

        //ActionsUI.fireUpdateEvent(this.action);
        this.actionStatus.wait.currentWaitHandle=Meteor.setTimeout(() =>{
            this.forAllParentStatuses(this.actionStatus, (status)=> {
                status.status=ActionStatus.RUNNING;
                delete status.wait;
                //ActionsUI.fireUpdateEvent(ActionsInstance.getAction(status.actionId)); // the question whether  this is not just waste of server/client resources
            });
            statements(this,whenDone);
        },timeout);
    }

    cancelWaitForAction(onCancel) {

        if(this.actionStatus.wait.currentSensorListenerHandle!==undefined) Sensors.removeSensorValueEventListener(this.actionStatus.wait.currentSensorListenerHandle);
        if(this.actionStatus.wait.currentVariableListenerHandle!==undefined) VariablesInstance.removeEventListener(this.actionStatus.wait.currentVariableListenerHandle);

        this.forAllParentStatuses(this.actionStatus, (status)=> {
            status.status=ActionStatus.RUNNING;
            delete status.wait;
        });

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

                this.forAllParentStatuses(this.actionStatus, (status)=> {
                    status.status=ActionStatus.WAITING_FOR_CONDITION;
                    status.wait={
                        trigerringStatusTransition:ActionStatus.WAITING_FOR_CONDITION,
                        since: new Date().getTime(),
                        elapsedTime:0,
                        duration: timeout,
                    };
                });
                Object.assign(this.actionStatus.wait, { onCancel: onCancel, onPause: onPause, onContinue: onContinue });
                this.fillPauseCancelAvailability(this.actionStatus,onPause,onContinue,onCancel);
                this.forAllParentStatuses(this.actionStatus, (status)=> {
                    ActionsUI.fireUpdateEvent(ActionsInstance.getAction(status.actionId));
                });

                //ActionsUI.fireUpdateEvent(this.action);

                this.actionStatus.wait.currentWaitHandle=Meteor.setTimeout(() =>{
                   this.cancelWaitForAction(onCancel);
                },timeout);

                var self=this;

                function onConditionFullfillment() {
                    if(self.actionStatus.wait!==undefined) {
                        Meteor.clearTimeout(self.actionStatus.wait.currentWaitHandle);
                        delete self.actionStatus.wait.currentWaitHandle;
                        if (self.actionStatus.wait.currentSensorListenerHandle !== undefined) Sensors.removeSensorValueEventListener(self.actionStatus.wait.currentSensorListenerHandle);
                        if (self.actionStatus.wait.currentVariableListenerHandle !== undefined) VariablesInstance.removeEventListener(self.actionStatus.wait.currentVariableListenerHandle);
                        statements(self, whenDone);
                    }
                    this.forAllParentStatuses(this.actionStatus, (status)=> {
                        status.status = ActionStatus.RUNNING;
                        delete status.wait;
                    });
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

    executeAction(actionId,actionName,statements,onPause,onContinue,onCancel,whenDone) {
        let subAction=ActionsInstance.getAction(actionId);
        if(subAction!==undefined) {
            let subActionStatus=subAction.actionStatus;
            if(subActionStatus.completionListeners!==undefined) subActionStatus.completionListeners.push(whenDone);
               else subActionStatus.completionListeners=[ whenDone ];
            switch(subActionStatus.status) {
                case undefined:
                case ActionStatus.READY:
                   this.actionStatus.subActionControlHandlers ={onCancel: onCancel, onPause: onPause, onContinue: onContinue};
                    ActionsInstance.startAction(subAction,this,() => {
                        this.actionStatus.subActionControlHandlers=undefined;
                        statements(this,() => {
                            whenDone();
                            // process additional callbacks
                            let listeners=subActionStatus.completionListeners;
                            if(listeners!==undefined) {
                                for(let listener of listeners) listener();
                                subActionStatus.completionListeners=undefined;
                            }
                        });
                    });
                    break;
                case ActionStatus.WAITING:
                case ActionStatus.WAITING_FOR_CONDITION:
                    this.actionStatus.subActionControlHandlers = {onCancel: onCancel, onPause: onPause, onContinue: onContinue};
                    this.actionStatus.childActionStatus=subActionStatus;
                    if(subActionStatus.parentActionStatus!==undefined) subActionStatus.parentActionStatus.push(this.actionStatus);
                        else subActionStatus.parentActionStatus=[this.actionStatus];
                    this.forAllParentStatuses(this.actionStatus, (status)=> {
                        status.status=subActionStatus.status;
                        status.wait= {
                            trigerringStatusTransition: subActionStatus.status,
                            since: subActionStatus.wait.since,
                            // useful on pause (stores the time that elapsed without the pause)
                            elapsedTime: subActionStatus.wait.elapsedTime,
                            duration: subActionStatus.wait.duration
                        }
                    });
                    Object.assign(this.actionStatus.wait, { onCancel: onCancel, onPause: onPause, onContinue: onContinue });
                    this.fillPauseCancelAvailability(this.actionStatus,onPause,onContinue,onCancel);
                    this.forAllParentStatuses(this.actionStatus, (status)=> {
                        ActionsUI.fireUpdateEvent(ActionsInstance.getAction(status.actionId));
                    });
            }
        }
    }

    /*
    stopProcessing() {
        if((typeof this.currentWaitHandle)!=='undefined' && this.currentWaitHandle!==null)
            Meteor.clearTimeout(this.currentWaitHandle);
        this.actionStatus=ActionStatus.READY;
    }*/

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

    schedule(scheduleId, scheduleName, delayMsec,base) {
        let schedule=Collections.Schedules.findOne(scheduleId);
        schedule.disabled=false;
        let startDate=schedule.executeOn;
        if(startDate===undefined || base==='NOW') startDate=new Date();
        let newDate=moment(startDate).add(delayMsec,'ms').toDate();
        schedule.executeOn=newDate;
        SchedulesInstance.stopSchedule(scheduleId);
        Collections.Schedules.update(scheduleId,{ $set: { executeOn: newDate, disabled: false }});
        SchedulesInstance.startSchedule(schedule);
        SchedulesUI.fireUpdateEvent(schedule);
    }

    cancelSchedule(scheduleId, scheduleName) {
        Collections.Schedules.update(scheduleId,{ $set: { disabled: true }});
        let updatedSchedule=Collections.Schedules.findOne(scheduleId);
        SchedulesInstance.stopSchedule(scheduleId);
        SchedulesUI.fireUpdateEvent(updatedSchedule);
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

    switchActionToSyntaxErrorState(action,e) {
        if(action.actionStatus.wait!==undefined) {
            if (action.actionStatus.wait.currentSensorListenerHandle !== undefined) Sensors.removeSensorValueEventListener(self.actionStatus.wait.currentSensorListenerHandle);
            if (action.actionStatus.wait.currentVariableListenerHandle !== undefined) VariablesInstance.removeEventListener(self.actionStatus.wait.currentVariableListenerHandle);
            if (action.actionStatus.wait.currentWaitHandle!== undefined) Meteor.clearTimeout(action.actionStatus.wait.currentWaitHandle);
            delete action.actionStatus.wait;
        }
        action.actionStatus.status=ActionStatus.SYNTAX_ERROR;
        delete action.actionStatus.message;
        if(e!==undefined) action.actionStatus.errorMessage=e.message;
        ActionsUI.fireUpdateEvent(action);
    }

    /** private */
    makeActionReady(action) {
        let actionStatus=action.actionStatus;
        actionStatus.status=ActionStatus.READY;
        delete actionStatus.message;
        if(actionStatus.parentActionStatus!==undefined) {
            for(status of actionStatus.parentActionStatus) {
                status.childActionStatus=undefined;
            }
        }
        actionStatus.parentActionStatus=undefined;
        ActionsUI.fireUpdateEvent(action);
    }

    /**
     * Start the given action
     * @param action action to execute
     * @param parentContext parent action context if the action is executed as a sub action, undefined otherwise
     * @param whenDone parent action call back function if the action is executed as a sub action, undefined otherwise
     */
    startAction(action, parentContext, whenDone) {
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

        let actionStatus=action.actionStatus;
        let originalStatus=actionStatus;
        if(actionStatus===undefined || actionStatus.status===ActionStatus.SYNTAX_ERROR) {
            try {
                actionStatus={
                    actionId: action._id,
                    status: ActionStatus.READY,
                    code: eval('('+action.code+')')
                };
            }
            catch(e) {
                log.error('Unable to evaluate an action.',e);
                log.error(action.code);
                actionStatus={ actionId: action._id, lastRun: new Date().getTime(), status : ActionStatus.SYNTAX_ERROR };
                if(originalStatus===undefined) {
                    ActionsUI.fireUpdateEvent(action);
                }
            }
            this.cache[action._id].actionStatus=actionStatus;
        }

        if (actionStatus.status!==ActionStatus.READY) return;
        actionStatus.lastRun=new Date().getTime();
        actionStatus.status=ActionStatus.RUNNING;

        let context=new ActionContext(action,actionStatus);
        try {
            if(parentContext!==undefined) {
                actionStatus.parentActionStatus = [ parentContext.actionStatus ];
                parentContext.actionStatus.childActionStatus = context.actionStatus;
            }
            if((typeof actionStatus.code)==='function')
            {
                actionStatus.code(context,() => {
                    this.makeActionReady(action);
                    if(whenDone!==undefined) whenDone();
                });
            }
            else {
                throw new Exception('action '+action.title+'is not a function');
            }
        }
        catch(e)
        {
            log.error("Unexpected error when starting action: "+action.title,e);
            this.switchActionToSyntaxErrorState(action,e);
            // switch parent action into error state and remove the binding between actions
            if(whenDone!==undefined) whenDone();
        }
    }

    getLeafActionStatus(actionStatus) {
        let result=actionStatus;
        while(result.childActionStatus!=undefined) {
            result=result.childActionStatus;
        }
        return result;
    }


    pauseLeafAction(actionStatus,elapsedTime) {
        try {
            var action=this.getAction(actionStatus.actionId);
            if (actionStatus.status===ActionStatus.WAITING || actionStatus.status===ActionStatus.WAITING_FOR_CONDITION) {
                if(actionStatus.wait.pauseAvailable) {
                    let context=new ActionContext(action,actionStatus);
                    Meteor.clearTimeout(actionStatus.wait.currentWaitHandle);
                    delete actionStatus.wait.currentWaitHandle;
                    actionStatus.wait.elapsedTime+=elapsedTime;
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
            this.switchActionToSyntaxErrorState(action,e);
        }
    }


    pauseAction(action) {
        if(action.actionStatus===undefined) return; //action may have been reconfigured in the mean time
        if (action.actionStatus.status!==ActionStatus.WAITING_FOR_CONDITION && action.actionStatus.status!=ActionStatus.WAITING) return;
        let childActionStatuses=this.getChildActionStatuses(action.actionStatus);
        let leafActionStatus=childActionStatuses[childActionStatuses.length-1];
        childActionStatuses=this.getParentActionStatuses(leafActionStatus);

        let elapsedTime=leafActionStatus.wait.elapsedTime+new Date().getTime()-leafActionStatus.wait.since;
        this.pauseLeafAction(leafActionStatus, elapsedTime);

        for(let i=1;i<childActionStatuses.length;i++) {
            let actionStatus=childActionStatuses[i];
            actionStatus.wait.elapsedTime=elapsedTime;
            actionStatus.status=ActionStatus.RUNNING;
            if(actionStatus.subActionControlHandlers!==undefined &&
                actionStatus.subActionControlHandlers.onPause!==undefined) {
                try {
                    let action=ActionsInstance.getAction(actionStatus.actionId);
                    let context=new ActionContext(action,actionStatus);
                    actionStatus.subActionControlHandlers.onPause(context, function () {
                        actionStatus.status=ActionStatus.PAUSED;
                        ActionsUI.fireUpdateEvent(action);
                    });
                }
                catch(e) {
                    log.error("Unexpected error when executing onPause handler of action: " + action.title, e);
                    this.switchActionToSyntaxErrorState(action,e);
                }
            }
            else {
                actionStatus.status=ActionStatus.PAUSED;
                ActionsUI.fireUpdateEvent(ActionsInstance.getAction(actionStatus.actionId));
            }
        }
    }


    /** private */
    continueLeafAction(actionStatus,since) {
        let action=this.getAction(actionStatus.actionId);
        try {
            let actionStatus = action.actionStatus;
            if (actionStatus !== ActionStatus.PAUSED) {
                let context=new ActionContext(action,actionStatus);
                if (actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING || actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING_FOR_CONDITION) {
                    actionStatus.status=ActionStatus.RUNNING;
                    actionStatus.wait.onContinue(context,function() {
                        actionStatus.status=ActionStatus.PAUSED;
                        if(actionStatus.wait.trigerringStatusTransition===ActionStatus.WAITING)
                        {
                            actionStatus.wait.since=since;
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
            this.switchActionToSyntaxErrorState(action,e);
        }
    }

    continueAction(action) {
        if(action.actionStatus===undefined) return; //action may have been reconfigured in the mean time
        if (action.actionStatus.status!==ActionStatus.PAUSED) return;
        let childActionStatuses=this.getChildActionStatuses(action.actionStatus);
        let leafActionStatus=childActionStatuses[childActionStatuses.length-1];
        childActionStatuses=this.getParentActionStatuses(leafActionStatus);

        let triggerringStatusTransition=leafActionStatus.wait.trigerringStatusTransition;
        let since=new Date().getTime();
        this.continueLeafAction(leafActionStatus, since);

        for(let i=1;i<childActionStatuses.length;i++) {
            let actionStatus=childActionStatuses[i];
            actionStatus.wait.since=since;
            actionStatus.status=ActionStatus.RUNNING;
            if(actionStatus.subActionControlHandlers!==undefined &&
                actionStatus.subActionControlHandlers.onContinue!==undefined) {
                try {
                    let action=ActionsInstance.getAction(actionStatus.actionId);
                    let context=new ActionContext(action,actionStatus);
                    actionStatus.subActionControlHandlers.onContinue(context, function () {
                        actionStatus.status=triggerringStatusTransition;
                        ActionsUI.fireUpdateEvent(action);
                    });
                }
                catch(e) {
                    log.error("Unexpected error when executing onContinue handler of action: " + action.title, e);
                    this.switchActionToSyntaxErrorState(action,e);
                }
            }
            else {
                actionStatus.status=triggerringStatusTransition;
                ActionsUI.fireUpdateEvent(ActionsInstance.getAction(actionStatus.actionId));
            }
        }
    }


    /** private */
    getChildActionStatuses(actionStatus) {
        let currentActionStatus=actionStatus;
        let result=[ currentActionStatus ];

        while(currentActionStatus.childActionStatus!==undefined) {
            currentActionStatus=currentActionStatus.childActionStatus;
            result.push(currentActionStatus);
        }
        return result;
    }

    /** private */
    getParentActionStatuses(actionStatus) {
        let result=[ actionStatus ];
        function collect(status) {
            if(status.parentActionStatus!==undefined) {
                for(s of status.parentActionStatus) result.push(s);
                for(s of status.parentActionStatus) collect(s);
            }
        }
        collect(actionStatus);
        return result;
    }


    /** private */
    stopLeafAction(actionStatus) {
        try {
            var action=this.getAction(actionStatus.actionId);
            var context = new ActionContext(action, actionStatus);
            if (actionStatus.status === ActionStatus.PAUSED) {
                if (actionStatus.wait.trigerringStatusTransition === ActionStatus.WAITING) {
                    if(actionStatus.wait.onCancel!==undefined) {
                        actionStatus.wait.onCancel(context,  () => {
                            this.makeActionReady(action);
                        });
                    }
                    else {
                        this.makeActionReady(action);
                    }
                }
                if (actionStatus.wait.trigerringStatusTransition === ActionStatus.WAITING_FOR_CONDITION) {
                    context.cancelWaitForAction(actionStatus.wait.onCancel);
                }
            }

            if (actionStatus.status === ActionStatus.WAITING) {
                Meteor.clearTimeout(actionStatus.wait.currentWaitHandle);
                delete actionStatus.wait.currentWaitHandle;
                let whenDone = function () {
                    this.makeActionReady(action);
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
            this.switchActionToSyntaxErrorState(action,e);
        }
    }

    /** private */
    stopNonLeafAction(actionStatus) {
        let action=this.getAction(actionStatus.actionId);
        if(actionStatus.subActionControlHandlers!==undefined &&
            actionStatus.subActionControlHandlers.onCancel!==undefined) {
            try {
                let context=new ActionContext(action,actionStatus);
                actionStatus.subActionControlHandlers.onCancel(context,  () => {
                    this.makeActionReady(action);
                });
            }
            catch(e) {
                log.error("Unexpected error when executing onCancel handler of action: " + action.title, e);
                this.switchActionToSyntaxErrorState(action,e);
            }
        }
        else {
            this.makeActionReady(action);
        }
    }

    stopAction(action) {
        let actionStatus = action.actionStatus;
        if (actionStatus === undefined) return;

        if (actionStatus.wait===undefined || !actionStatus.wait.cancelAvailable) {
            log.error('This action can\'t be cancelled');
            return;
        }
        // continue on parent action(s)
        let listeners=actionStatus.completionListeners;
        if(listeners!==undefined) {
            for(let listener of listeners) listener();
            actionStatus.completionListeners=undefined;
        }
        let childActionStatuses=this.getChildActionStatuses(actionStatus);
        let leafActionStatus=childActionStatuses[childActionStatuses.length-1];
        //childActionStatuses=this.getParentActionStatuses(leafActionStatus);
        this.stopLeafAction(leafActionStatus);
        for(let i=childActionStatuses.length-2;i>=0;i--) {
            this.stopNonLeafAction(childActionStatuses[i]);
        }
    }
}

ActionsInstance=new Actions();
