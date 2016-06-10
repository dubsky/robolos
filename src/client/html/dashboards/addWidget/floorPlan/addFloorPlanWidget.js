Template.addFloorPlanWidget.helpers({
    selectedIcon : function() {
        if(this.widget) return this.widget.icon;
    }
});
Template.addFloorPlanWidget.events({

    'click .updateProperties': function(event, instance) {

        var dashboard=Session.get(CURRENT_DASHBOARD);
        var widgets=dashboard.widgets;
        if((typeof widgets)==='undefined') widgets=[];

        widgets.push({
            id : (new Mongo.ObjectID()).toHexString(),
            title: document.forms['editProperties'].elements['title'].value,
            icon: document.forms['editProperties'].elements['icon'].value,
            type: 'floorPlan'
        });

        Meteor.call('updateDashboard',{$set : { widgets : widgets}},dashboard._id);
        Router.go('render.dashboard',{_id: dashboard._id});
    },

    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }
});


Router.route('dashboard-floorPlan/:_id',
    function () {
        var id = this.params._id;
        this.render('addFloorPlanWidget');
    },
    {
        name: 'dashboard-floorPlan'
    }
);