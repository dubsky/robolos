Template.selectAction.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedAction');
        return (typeof selection==='undefined') || selection===null;
    }
});


Template.selectAction.events({

    'click .addAction': function(event, instance) {
        Template.modal.current.set({template : 'editActionWidgetProperties', data : {widget: this, create : true }});
    },
    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }

});

Template.selectAction.onRendered(function() {
    Session.set('selectedAction',null);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.selectAction.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

Router.route('dashboard-selectAction/:_id',
    function () {
        var id = this.params._id;
        this.render('selectAction');
    },
    {
        name: 'dashboard-selectAction',
        waitOn: function() {
            return App.subscribe('actions');
        }
    }
);
