later.date.localTime();

let LAST_CALENDAR_DATE='LAST_CALENDAR_DATE';


Template.calendar.onRendered(function() {
    var calendarElement=$('#calendar');
    let configuration={
        firstDay:1,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        handleWindowResize:true,
        eventClick: function(event, element) {
            if(event.id.startsWith('recurring')) {
                let id=event.id.split('_')[1];
                Router.go('render.schedule',{_id:id});
            }
            else {
                Router.go('render.schedule',{_id:event.id});
            }
        },
        dayClick: function(date, jsEvent, view) {
            Template.modal.current.set( {template : 'addEvent', data : { date : date} });
        },
        eventDrop: function(event, delta, revertFunc) {
            if(event.id.startsWith('recurring')) {
                $('#calendar').fullCalendar('refetchEvents');
            }
            else {
                Meteor.call("updateSchedule",{ $set : {executeOn: event.start.toDate()} },event.id,function() {
                    $('#calendar').fullCalendar('refetchEvents');
                });
            }
        },
        events: function(start, end, timezone, callback) {
            var events=[];
            var filter= {
                $or: [
                    {
                        $and: [
                            { type: 'one-time'},
                            { executeOn: {$gt: start.toDate()}},
                            { executeOn: {$lt: end.toDate()}}
                        ]
                    },
                    {
                        type: 'cron'
                    }
                ]
            };

            let today=new Date().getTime();

            function colorize(e) {
                if(e.start<today) {
                    e.color='grey';
                }
            }

            Collections.Schedules.find(filter).forEach(function(schedule) {
                if(schedule.executeOn) {
                    let i=events.length;
                    events[i]=
                    {
                        id:schedule._id,
                        title: schedule.title,
                        start: schedule.executeOn
                    };
                    colorize(events[i]);
                }
                else if(schedule.cron) {
                    if(schedule.action!==undefined) {
                        let action=Collections.Actions.findOne(schedule.action);
                        if(action!==undefined && action.calendarDroppable) {
                            for(let cron of schedule.cron) {
                                let sched=later.schedule(later.parse.cron(CronExpression.getCronExpression(cron)));
                                let dates=sched.nextRange(50, new Date(start), new Date(end));
                                for(let date of dates) {
                                    let i=events.length;
                                    events[i]=
                                    {
                                        id:'recurring_'+schedule._id+'_'+i,
                                        title: schedule.title,
                                        start: date[1]
                                    };
                                    events[i].color='#477343';
                                    colorize(events[i]);
                                }
                            }
                        }
                    }
                }
            });
            callback(events);
        }
    };
    let lastDate=Session.get(LAST_CALENDAR_DATE);
    if(lastDate!==undefined) configuration.defaultDate=moment(lastDate);
    calendarElement.fullCalendar(configuration);

    /*
    if(!TOUCH_DEVICE) {
        var scrollBarParams = {
            theme: "dark-thick",
            axis: 'yx',
            autoHideScrollbar: true,
            scrollbarPosition: 'outside',
            scrollButtons: {enable: true}
        };
        calendarElement.mCustomScrollbar(scrollBarParams);
    }*/
});


Template.calendar.onDestroyed(function() {
    Session.set(LAST_CALENDAR_DATE,$('#calendar').fullCalendar('getDate').toDate());
});


Router.route('calendar',
    function () {
        Session.set(VIEW_SCHEDULE_RETURN_ROUTE,'calendar');
        this.render('calendar');
    },
    {
        name: 'calendar',
        waitOn: function() {
            return [App.subscribe('schedules'),App.subscribe('actions') ];
        }
    }
);
