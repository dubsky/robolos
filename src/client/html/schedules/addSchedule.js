let prepareInitialType=function(context) {
    console.log(context);
    let c=Collections.Schedules.Types[0].value;
    if(context!==undefined && context.schedule!==undefined && context.schedule.type!==undefined) c=context.schedule.type;
    return c;
}


Template.addSchedule.helpers({

    collection: function() {
        return Collections.Schedules
    },

    schema: Schemas.Schedule,

    typeOptions: function () {
        return Collections.Schedules.Types;
    },

    selectedType:function(type) {
        return type===Session.get("selectedType");
    },

    container() {
        return {};
    },

    schedule() {
        return (this.schedule===undefined || this.schedule.type===undefined) ? { type: prepareInitialType(this) } : this.schedule;
    }

});

Template.addSchedule.events({

    'click .cancel' :function(event) {
        Session.set(CURRENT_GRAPH_SESSION_KEY,undefined);
        EditContext.setContext(undefined);
        Router.go('schedules');
        return false;
    },

    'change .typeSelector' : function(e) {
        Session.set("selectedType", e.target.value);
    },

});

Template.addSchedule.onCreated(function() {
    Session.set("selectedType", prepareInitialType(this.data));
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
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe('actions')];
            });
        }
    }
);


analogValueChartGetData=function(modifier) {
    let graph=Session.get(CURRENT_GRAPH_SESSION_KEY);
    if(graph!=undefined) {
        modifier.$set['analogValueSchedule.data']=graph;
    }
    return modifier;
};

AutoForm.hooks({
    addScheduleForm: {
        after: {
            'method-update': function() {
                Session.set(CURRENT_GRAPH_SESSION_KEY,undefined);
                Router.go('schedules');
            }
        },
        before:{
            'method-update': analogValueChartGetData,
        },
        onError: function(formType, error) {
            console.log('Unexpected error',error);
        },
        formToModifier: function(modifier) {
            EditContext.getContext().modifier=modifier;
            return modifier;
        }
    }
});
