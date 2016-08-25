class Schedules {

    constructor() {
        this.runningTasks={};
        this.length=0;
    }

    getCount() {
        return this.length;
    }

    startSchedule(schedule) {
        this.runningTasks[schedule._id]=[];
        if(schedule.disabled) return;
        if(schedule.cron!==undefined) {
            for(var i in schedule.cron)
            {
                var taskId=schedule._id+'_'+i;
                SyncedCron.add({
                    name: taskId,
                    schedule: function(parser) {
                        // parser is a later.js.parse object
                        return parser.cron(CronExpression.getCronExpression(schedule.cron[i]));
                    },
                    job: function() {
                        log.event(
                            function(context) {
                                return ['Executing regularly scheduled task \''+context.title+'\'',context.keywords];
                            },
                            schedule
                        );
                        log.info('Executing regularly scheduled task:'+schedule.title);
                        if(schedule.action!=undefined) {
                            var action=ActionsInstance.getAction(schedule.action);
                            if (action!==undefined) ActionsInstance.startAction(action);
                        }
                    }
                });
                this.runningTasks[schedule._id][i]=taskId;
            }
            this.length++;
        }
        if(schedule.executeOn!==undefined) {
            if((schedule.executeOn.getTime()) > (new Date().getTime()))
            {
                var taskId=schedule._id+'_0';
                var self=this;
                SyncedCron.add({
                    name: taskId,
                    schedule: function(parser) {
                        var e=schedule.executeOn;
                        return parser.recur().on(e).fullDate();
                    },
                    job: function() {
                        log.event(
                            function(context) {
                                return ['Executing calendar task \''+context.title+'\'',context.keywords];
                            },
                            schedule
                        );
                        log.info('Executing calendar task:'+schedule.title);
                        delete self.runningTasks[schedule._id];
                        var action=ActionsInstance.getAction(schedule.action);
                        if (typeof action!==undefined) {
                            ActionsInstance.startAction(action);
                        }
                    }
                });
                this.runningTasks[schedule._id]=[];
                this.runningTasks[schedule._id][0]=taskId;
                this.length++;
            }
        }
        if(schedule.type==='value') {
            ValueSchedules.startSchedule(schedule);
        }
    }

    stopSchedule(scheduleId) {
        var tasks=this.runningTasks[scheduleId];
        if(tasks===undefined) {
            ValueSchedules.stopSchedule(scheduleId);
        }
        else {
            for(var i in tasks) {
                SyncedCron.remove(scheduleId+'_'+i);
            }
            delete this.runningTasks[scheduleId];
            this.length--;
        }
    }

    nextExecution(scheduleId) {
        let tasks=this.runningTasks[scheduleId];
        if(tasks===undefined) {
            return ValueSchedules.getNextExecutionTime(scheduleId);
        }
        else {
            let min=0;
            for(let i in tasks) {
                let nextExecution=SyncedCron.nextScheduledAtDate(scheduleId+'_'+i);
                if(nextExecution!=0 && nextExecution!=undefined)
                {
                    let next=nextExecution.getTime();
                    if(min<next) min=next;
                }
                else {
                    log.error('Assertion failed, obsolete task still in the list');
                    delete self.runningTasks[scheduleId];
                }
            }
            return min;
        }
    }

    start() {
        /*
        SyncedCron.config({
            logger: function(opts) {
                switch(opts.level) {
                    case 'info':
                        log.info(opts.message);
                        break;
                    case 'debug':
                        log.debug(opts.message);
                        break;
                    case 'error':
                    case 'warn':
                    default:
                        log.error(opts.message);
                        break;
                }
            }
        });*/
        SyncedCron.options.log=false;

        var self=this;
        Collections.Schedules.find().forEach(
            function(schedule) {
                self.startSchedule(schedule);
        });

        SyncedCron.start();
    }

}

SchedulesInstance=new Schedules();

