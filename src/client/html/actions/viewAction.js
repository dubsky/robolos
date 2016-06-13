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
            return App.subscribe('actions');
        }
    }
);

function backToActionFlow() {
    var context=EditContext.getContext();
    if(context!=null) {
        context.keepEditContextOnNextRoute();
    }
    Router.go('render.action', { _id: Session.get(CURRENT_ACTION)._id });
}

Template.viewAction.events({

    'click .cancel' :function(event) {
        backToActionFlow();
        return false;
    },

    'click .viewContent' :function(event) {
        backToActionFlow();
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