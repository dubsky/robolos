let CURRENT_SCHEDULE="CURRENT_SCHEDULE";
VIEW_SCHEDULE_RETURN_ROUTE="VIEW_SCHEDULE_RETURN_ROUTE";

Template.viewSchedule.helpers({

    collection: function() {
        return Collections.Schedules
    },

    schema: Schemas.Schedule,

    type(type) {
        return this.schedule.type==type;
    },

    analogValueData() {
        return this.schedule.analogValueSchedule.data;
    }
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


function calculateReturnRoute() {
    let returnRoute=Session.get(VIEW_SCHEDULE_RETURN_ROUTE);
    if(returnRoute!=undefined) Router.go(returnRoute); else Router.go('schedules');
}

Template.viewSchedule.events({

    'click .cancel' :function(event) {
        Session.set(CURRENT_GRAPH_SESSION_KEY,undefined);
        EditContext.setContext(undefined);
        calculateReturnRoute();
        return false;
    },

    'click .delete' :function(event) {
        console.log(this);
        Meteor.call('deleteSchedule',this.schedule._id,function() {
            Session.set(CURRENT_GRAPH_SESSION_KEY,undefined);
            EditContext.setContext(undefined);
            calculateReturnRoute();
            return false;
        });
    }

});

AutoForm.hooks({
    viewScheduleForm: {
        after: {
            'method-update': function() {
                EditContext.setContext(undefined);
                Session.set(CURRENT_GRAPH_SESSION_KEY,undefined);
                calculateReturnRoute();
            }
        },
        before:{
            'method-update': analogValueChartGetData
        },
        formToModifier: function(modifier) {
            EditContext.getContext().modifier=modifier;
            return modifier;
        }
    }
});