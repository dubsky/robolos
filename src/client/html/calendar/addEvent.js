Template.addEvent.onCreated(function () {
    Template.instance().firstStep=new ReactiveVar(true);
});


Template.addEvent.helpers({

    firstStep: function() {
        return Template.instance().firstStep.get();
    },
    emptySelection : function() {
        var selection=Session.get('selectedAction');
        return (typeof selection==='undefined') || selection===null;
    },
    document: function () {
        return { title:Session.get('selectedActionName'), executeOn: this.date.toDate() };
    },

    collection: function() {
        return Collections.Schedules
    },

    filter : { calendarDroppable: true },
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
            },
            type: {
                label: "Schedule Type",
                type: String,
                defaultValue:'one-time'
            }
        });
    }
});

Template.addEvent.events({
    'click .recurringEvent': function() {
        Router.go('addSchedule');
    },

    'click .nextEvent': function() {
        Template.instance().firstStep.set(false);
    },

    'click .previousEvent': function() {
        Template.instance().firstStep.set(true);
    },

    'click .finishEvent': function() {
        $("#eventForm").submit();
    },

    'click .close':function() {
        $('#eventEditor').modal('hide');
    }

});

Template.addEvent.onRendered(function() {
    SemanticUI.modal("#eventEditor");
});

AutoForm.hooks({
    eventForm: {
        before: {
            'method-update': function(doc) {
                var selection=Session.get('selectedAction');
                doc.$set.action=selection;
                doc.$set.type='one-time';
                return doc;
            }
        },
        after: {
            'method-update': function(error,result) {
                $('#calendar').fullCalendar('refetchEvents');
                $('#eventEditor').modal('hide');
            }
        },
        onError: function(formType, error) {
            console.log(error);
        }
    }
});