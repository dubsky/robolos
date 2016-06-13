var CURRENT_SCHEDULE="CURRENT_SCHEDULE";

Template.viewSchedule.helpers({

    collection: function() {
        return Collections.Schedules
    },

    schema: Schemas.Schedule


});


Router.route('schedules/:_id',
    function () {
        var self=this;
        var params = self.params;
        var item;
        if(EditContext.getContext()===undefined) {
            item = Collections.Schedules.findOne({_id: params._id });
            if(item==null) {
                self.render('notFound');
                return;
            }
            EditContext.setContext(new EditContext('Edit Schedule',{routeName: 'render.schedule', _id:params._id },item));
            Session.set(CURRENT_SCHEDULE, item);
        }
        else {
            // returning back to edited document
            AutoForm.resetForm('viewScheduleForm');
            item=EditContext.getContext().getDocument();
        }
        self.render('viewSchedule',{data: { schedule: item }});
    },
    {
        name: 'render.schedule',
        waitOn: function() {
            return [App.subscribe('schedules',{_id : this.params._id},false),App.subscribe('actions')];
        }
    }
);

Template.viewSchedule.events({

    'click .cancel' :function(event) {
        EditContext.setContext(undefined);
        Router.go('schedules');
        return false;
    }

});

AutoForm.hooks({
    viewScheduleForm: {
        after: {
            'method-update': function() {
                EditContext.setContext(undefined);
                Router.go('schedules');
            }
        },

        formToModifier: function(modifier) {
            EditContext.getContext().modifier=modifier;
            return modifier;
        }
    }
});