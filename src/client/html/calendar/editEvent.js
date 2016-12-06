Template.editEvent.helpers({

    document: function () {
        return Collections.Schedules.findOne({_id: this.event.id});
    },

    schema: function() {
        return new SimpleSchema({
            title: {
                type: String,
                label: "Name",
                optional: false,
                max: 64
            },
            description: {
                type: String,
                label: "Description",
                optional: true
            },
            action: {
                label: "Action",
                type: String,
                autoform: {
                    icon: 'fa-clock-o'
                }
            },
            executeOn: {
                label: "Execute on",
                type: Date,
                autoform: {
                    icon: 'fa-clock-o'
                }
            }
        });
    }
});

Template.editEvent.events({
    'click .changeAction': function() {
        Router.go('render.schedule',{_id:this.event.id});
    },

    'click .saveEvent': function() {
        $("#eventForm").submit();
    },
    'click .deleteEvent': function() {
        $('#calendar').fullCalendar('removeEvents', this.event.id);
        ConnectionManager.call('deleteSchedule',this.event.id,function() { $('#eventEditor').modal('hide'); });
    },
    'click .close':function() {
        $('#eventEditor').modal('hide');
    }
});

Template.editEvent.onRendered(function() {
    SemanticUI.modal("#eventEditor");
});

AutoForm.hooks({
    eventForm: {
        after: {
            'method-update': function(error,result) {
                $('#eventEditor').modal('hide');
                $('#calendar').fullCalendar('refetchEvents');
            }
        },
        onError: function(formType, error) {
            console.log(error);
        }
    }
});