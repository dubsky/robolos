Template.selectVariable.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedVariable');
        return (typeof selection==='undefined') || selection===null;
    }
});


Template.selectVariable.events({

    'click .addVariable': function(event, instance) {
        Template.modal.current.set({template : 'editVariableWidgetProperties', data : {widget: this, create : true }});
    },

    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }

});

Template.selectVariable.onRendered(function() {
    Session.set('selectedVariable',null);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.selectVariable.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

Router.route('dashboard-selectVariable/:_id',
    function () {
        var id = this.params._id;
        this.render('selectVariable');
    },
    {
        name: 'dashboard-selectVariable',
        waitOn: function() {
            return App.subscribe('variables');
        }
    }
);