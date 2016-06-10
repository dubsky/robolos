Template.addAction.actionCreationCancelled=function() {
    var context=EditContext.getContext();
    if(context!=null) {
        context.keepEditContextOnNextRoute();
        var route=context.getReturnRoute();
        route.onCancel();
    }
    else {
        Router.go('actions');
    }
    return false;
}

Template.addAction.events({
    'click .cancel' :Template.addAction.actionCreationCancelled,
    'click .goBack' : Template.addAction.actionCreationCancelled
});

Router.route('action-create', function () {
    this.render('addAction');
}, { name: 'addAction'});


Template.addAction.helpers({

    collection: function() {
        return Collections.Actions;
    },

    editContext : function() {
        return EditContext.getContext();
    },

    schema: Schemas.Action

});


AutoForm.hooks({
    addActionForm: {
        after: {
            'method-update': function(err,result) {
                //Router.go('actions');
                var context=EditContext.getContext();
                console.log('save action!');
                if(context!=undefined) {
                    context.keepEditContextOnNextRoute();
                }
                Router.go('render.action',{_id: result});
            }
        }
    }
});