Template.addSchedule.helpers({

    collection: function() {
        return Collections.Schedules
    },

    schema: Schemas.Schedule

});

Template.addSchedule.events({

    'click .cancel' :function(event) {
        Router.go('schedules');
        return false;
    }

});

Router.route('schedule-create', function () {
        var item;
        if(EditContext.getContext()===undefined) {
            item={};
            EditContext.setContext(new EditContext('Create Schedule',{routeName: 'addSchedule' },item));
        }
        else {
            item=EditContext.getContext().getDocument();
            AutoForm.resetForm('viewScheduleForm');
        }
        this.render('addSchedule',{data: { schedule: item }});
    },
    {
        name: 'addSchedule',
        waitOn: function() {
            return [App.subscribe('actions')];
        }
    }
);


AutoForm.hooks({
    addScheduleForm: {
        after: {
            'method-update': function() {
                Router.go('schedules');
            }
        },
        formToModifier: function(modifier) {
            EditContext.getContext().modifier=modifier;
            return modifier;
        }
    }
});
