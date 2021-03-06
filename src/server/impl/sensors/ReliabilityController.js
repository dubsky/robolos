class ReliabilityControllerClass {

    constructor() {
        this.runningChanges=new Map();
    }

    setupTimeout(changeRecord) {
        changeRecord.waitHandle=Meteor.setTimeout(()=>{
            if (changeRecord.waitRound<7) changeRecord.waitRound++;
            this.setupTimeout(changeRecord);
            try {
                log.debug("Haven't received confirmation about change to "+changeRecord.driverInstance.getId()+' '+changeRecord.deviceId+';'+changeRecord.sensorId+",resending");
                changeRecord.driverInstance.getDriver().performAction(changeRecord.deviceId,changeRecord.sensorId,changeRecord.chosenVariable,changeRecord.action,changeRecord.value);
            }
            catch(e)
            {
                log.error('Error when retrying to perform an action '+changeRecord.action+' on '+changeRecord.driverInstance.getId()+' '+changeRecord.deviceId+';'+changeRecord.sensorId+';'+changeRecord.chosenVariable+
                    ' with value'+EJSON.stringify(changeRecord.value),e);
                console.log(e);
            }
        },(1<<changeRecord.waitRound)*100);
    }

    onPerformAction(driverInstance,deviceId,sensorId,chosenVariable, action, parameters) {
        let desiredValue;
        switch(action) {
            case SENSOR_ACTIONS.GET_VALUE:
                return;
            case SENSOR_ACTIONS.SET_VALUE:
                desiredValue=parameters;
                break;
            case SENSOR_ACTIONS.SWITCH_ON:
                desiredValue=1;
                break;
            case SENSOR_ACTIONS.SWITCH_OFF:
                desiredValue=0;
                break;
            default:
                throw new Exception('Assertion failed; unknown action');
        }

        let key=driverInstance.getId()+deviceId+sensorId+chosenVariable.name;
        let existingRecord=this.runningChanges.get(key);
        if (existingRecord!==undefined) {
            existingRecord.action=action;
            existingRecord.value=desiredValue;
            existingRecord.timestamp=new Date().getTime();
        }
        else
        {
            existingRecord={
                driverInstance:driverInstance,
                deviceId:deviceId,
                sensorId:sensorId,
                chosenVariable:chosenVariable,
                action:action,
                value:desiredValue,
                waitRound:0
            };
            this.runningChanges.set(key,existingRecord);
            this.setupTimeout(existingRecord);
        }
    }

    onReceivedSensorInformation(driverInstance,deviceId,sensorId,value) {
        for(let variable in value)
        {
            if(typeof(variable) === 'string') {
                let key=driverInstance.getId()+deviceId+sensorId+variable;
                let existingRecord=this.runningChanges.get(key);
                if (existingRecord!==undefined) {
                    if(existingRecord.value==value[variable])
                    {
                        Meteor.clearTimeout(existingRecord.waitHandle);
                        this.runningChanges.delete(key);
                    }
                }
            }
        }

    }
    
}


ReliabilityController=ReliabilityControllerClass;