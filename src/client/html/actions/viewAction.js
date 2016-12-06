var CURRENT_ACTION="CURRENT_ACTION";

Template.viewAction.helpers({

    collection: function() {
        return Collections.Actions
    },

    schema: Schemas.Action,

    editContext : function() {
        return EditContext.getContext();
    }

});

Template.viewAction.onCreated(function() {
    INITIAL_ACTION_RENDERING_MODE=ACTION_RENDERING_MODE.PROPERTIES;
});


Router.route('action-properties/:_id',
    function () {
        var self=this;
        var params = self.params;
        var item = Collections.Actions.findOne({_id: params._id });
        if(item==null) {
            self.render('notFound');
            return;
        }
        Session.set(CURRENT_ACTION, item);
        self.render('viewAction',{data: { action: item }});
    },
    {
        name: 'render.action.properties',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return ConnectionManager.subscribe('actions');
            });
        }
    }
);


backToActionFlow=function() {
    var context=EditContext.getContext();
    if(context!=null) {
        context.keepEditContextOnNextRoute();
        Router.go('render.action', { _id: Session.get(CURRENT_ACTION)._id });
    }
    else {
        Router.go('actions');
    }
};

Template.viewAction.events({

    'click .cancel' :function(event) {
        backToActionFlow();
        return false;
    },

    'click .viewContent' :function(event) {
        var context=EditContext.getContext();
        if(context!=null) {
            context.keepEditContextOnNextRoute();
        }
        Router.go('render.action', { _id: Session.get(CURRENT_ACTION)._id });
        return false;
    },

    'click .goBack' : Template.renderAction.actionEditationFinished
});

AutoForm.hooks({
    viewActionForm: {
        after: {
            'method-update': function() {
                backToActionFlow();
            }
        }
    }
});