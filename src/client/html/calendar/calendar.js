later.date.localTime();

let LAST_CALENDAR_DATE='LAST_CALENDAR_DATE';


let setupLayout=function() {
    let contentWrapper = document.getElementById('content-wrapper');
    //contentWrapper.style.paddingLeft=contentWrapper.style.paddingRight='0';
    let calendarPanel = $('#calendar');
    calendarPanel.css('min-width',contentWrapper.clientWidth < 590 ? 590 : calendarPanel.get(0).clientWidth);
    let c=contentWrapper.clientHeight-55;
    if($('#calendar').get(0).clientHeight<c) $('#calendar').fullCalendar('option', 'height', c); else $('#calendar').fullCalendar('option', 'height', 'auto');
};



Template.calendar.onRendered(function() {
    var calendarElement=$('#calendar');
    let configuration={
        firstDay:1,
        height: 'auto',
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
                ConnectionManager.call("updateSchedule",{ $set : {executeOn: event.start.toDate()} },event.id,function() {
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

    setupLayout();
    $(window).resize(setupLayout);

});


Template.calendar.onDestroyed(function() {
    Session.set(LAST_CALENDAR_DATE,$('#calendar').fullCalendar('getDate').toDate());
    $(window).off('resize',setupLayout);

});


Router.route('calendar',
    function () {
        Session.set(VIEW_SCHEDULE_RETURN_ROUTE,'calendar');
        this.render('calendar');
    },
    {
        name: 'calendar',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe('schedules'),ConnectionManager.subscribe('calendarActions') ];
            });
        }
    }
);
