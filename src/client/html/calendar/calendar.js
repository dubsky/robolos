Template.calendar.onRendered(function() {
    var calendarElement=$('#calendar');
    calendarElement.fullCalendar({
        firstDay:1,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        handleWindowResize:true,
        eventClick: function(event, element) {
            Template.modal.current.set( {template : 'editEvent', data : { event : event} });
        },
        dayClick: function(date, jsEvent, view) {
            Template.modal.current.set( {template : 'addEvent', data : { date : date} });
        },
        eventDrop: function(event, delta, revertFunc) {
            Meteor.call("updateSchedule",{ $set : {executeOn: event.start.toDate()} },event.id,function() {
                $('#calendar').fullCalendar('refetchEvents');
            });
        },
        events: function(start, end, timezone, callback) {
            var events=[];
            var filter={
                $and: [
                    {executeOn: {$gt: start.toDate()}},
                    {executeOn: {$lt: end.toDate()}}
                ]
            };
            Collections.Schedules.find(filter).forEach(function(schedule) {
                if(schedule.executeOn) {
                    var i=events.length;
                    events[i]=
                    {
                        id:schedule._id,
                        title: schedule.title,
                        start: schedule.executeOn
                    };
                    if(events[i].start<new Date().getTime()) {
                        events[i].color='grey';
                    }
                }
            });
            callback(events);
        }
    });
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

Router.route('calendar',
    function () {
        this.render('calendar');
    },
    {
        name: 'calendar',
        waitOn: function() {
            return [App.subscribe('schedules'),App.subscribe('actions') ];
        }
    }
);
