Template.newActionButton.events({

    'click .createNewAction' : function() {
        $('.modal').modal('hide');
        EditContext.getContext().keepEditContextOnNextRoute();
        Router.go('addAction');
    }

});