class ValueSchedulesClass {

    constructor () {
        this.runningSchedules={};
        this.drivenSensors={};
    }

    getCurrentValue(runningSchedule,currentTime,interpolated) {
        let min=runningSchedule.schedule.analogValueSchedule.minValue;
        let max=runningSchedule.schedule.analogValueSchedule.maxValue;
        if(min===undefined) min=0;
        if(max===undefined) max=100;
        if(interpolated==undefined) interpolated=runningSchedule.spline.interpolate(currentTime);
        if(interpolated<0) interpolated=0;
        if(interpolated>1) interpolated=1;
        let value=min+interpolated*(max-min);
        //log.debug('value :'+value);
        return value;
    }

    getCurrentTime() {
        let dayStart=moment().startOf('day');
        let currentTime=moment().diff(dayStart)/3600/1000;
        return currentTime;
    }

    startSchedule(schedule) {
        //log.debug('start value schedule',schedule);
        let spline=new CubicSpline(schedule.analogValueSchedule.data.x,schedule.analogValueSchedule.data.y);
        let runningSchedule={ schedule: schedule, spline: spline, sensorsFollowing:[]};
        let onScheduleChange= () => {
            let currentTime=this.getCurrentTime();
            let interpolated=runningSchedule.spline.interpolate(currentTime);

            let direction=CubicInterpolationAnticipationDirection.ANY;
            let delta=0.01;
            if(interpolated<0) {
                direction=CubicInterpolationAnticipationDirection.UP;
                delta=Math.max(0.01,-interpolated);
            }
            if(interpolated>1) {
                direction=CubicInterpolationAnticipationDirection.DOWN;
                delta=Math.max(0.01,interpolated-1);
            }

            let timeToSchedule=spline.anticipate(currentTime,delta,direction,24);

            //log.debug('setting sensors:'+runningSchedule.sensorsFollowing);
            let value=this.getCurrentValue(runningSchedule,currentTime,interpolated);
            for(let sensorId of runningSchedule.sensorsFollowing) {
                this.setSensor(sensorId,value);
            }

            //log.debug('timeToSchedule:'+timeToSchedule);
            if(timeToSchedule!==undefined) {
                let dayStart=moment().startOf('day');
                runningSchedule.nextTime=dayStart.valueOf()+timeToSchedule*3600*1000;


                let calculatedTimeout;
                if(timeToSchedule>currentTime) calculatedTimeout=timeToSchedule-currentTime; else calculatedTimeout=24-currentTime+timeToSchedule;

                //console.log('in hours '+calculatedTimeout+' in msec '+calculatedTimeout*3600*1000+ ' '+currentTime+ ' '+timeToSchedule+' anticipated value:'+this.getCurrentValue(runningSchedule,timeToSchedule));

                let timeout=Math.max(calculatedTimeout*3600*1000,100);
                runningSchedule.handle=Meteor.setTimeout( () => {
                    onScheduleChange();
                    runningSchedule.nextTime=null;
                    runningSchedule.handle=null;
                },timeout);
            }

            var action=ActionsInstance.getAction(schedule.action);
            if ((typeof action)!=='undefined') ActionsInstance.startAction(action);

        };

        onScheduleChange();
        this.runningSchedules[schedule._id]=runningSchedule;
    }

    getNextExecutionTime(scheduleId) {
        let runningSchedule=this.runningSchedules[scheduleId];
        if(runningSchedule!=null && runningSchedule.handle!=null) {
            return runningSchedule.nextTime;
        }
    }

    stopSchedule(scheduleId) {
        if(this.runningSchedules[scheduleId].handle!=null)
            Meteor.clearTimeout(this.runningSchedules[scheduleId].handle);
    }

    setSensor(sensorId, value) {
        //log.debug('setting value:'+value);
        let id=Sensors.getSensorIdComponents(sensorId);
        Sensors.performAction(id[0],id[1],id[2],null,SENSOR_ACTIONS.SET_VALUE,value);
    }

    bindSensorToSchedule(scheduleId, sensorId) {
        this.unbindSensorFromSchedules(sensorId);
        //log.debug(this.runningSchedules[scheduleId]);
        let runningSchedule=this.runningSchedules[scheduleId];
        if(runningSchedule!==undefined) {
            let value=this.getCurrentValue(runningSchedule,this.getCurrentTime());
            this.setSensor(sensorId,value);
            runningSchedule.sensorsFollowing.push(sensorId);
        }
        this.drivenSensors[sensorId]=scheduleId;
    }

    unbindSensorFromSchedules(sensorId) {
        let currentSchedule=this.drivenSensors[sensorId];
        if(currentSchedule!==undefined) {
            let schedule=this.runningSchedules[currentSchedule];
            if(schedule!==undefined) {
                for(let v=0;v<schedule.sensorsFollowing.length;v++) {
                    if(schedule.sensorsFollowing[v]===sensorId) {
                        schedule.sensorsFollowing.splice(v,1);
                        break;
                    }
                }
            }
        }
    }

}

ValueSchedules=new ValueSchedulesClass();