Template.selectSensor.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedSensor');
        return (typeof selection==='undefined') || selection===null;
    }
});


Template.selectSensor.events({

    'click .addSensor': function(event, instance) {
        Template.modal.current.set({template : 'editSensorWidgetProperties', data : {widget: this, create : true }});
    },
    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD_ID);
        Router.go('render.dashboard',{_id: dashboard});
    }

});

Router.route('dashboard-selectSensor/:_id',
    function () {
        var id = this.params._id;
        Session.set(CURRENT_DASHBOARD_ID, id);
        this.render('selectSensor');
    },
    {
        name: 'dashboard-selectSensor'
    }
);


Template.selectSensor.onRendered(function() {
    Session.set('selectedSensor',null);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.selectSensor.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});
