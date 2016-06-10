Template.addWidgetSelectWidgetType.FLOOR_PLAN_MODE="addWidgetSelectWidgetType.FLOOR_PLAN_MODE";

Template.addWidgetSelectWidgetType.helpers({

    floorPlanMode: function() {
        return Session.get(Template.addWidgetSelectWidgetType.FLOOR_PLAN_MODE);
    },

});

Template.addWidgetSelectWidgetType.events({

    'click .addSensor': function(event, instance) {
        $("#selectWidgetType").modal('hide');
        Router.go('dashboard-selectSensor',{_id: Session.get(CURRENT_DASHBOARD_ID)});
    },

    'click .addAction': function(event, instance) {
        $("#selectWidgetType").modal('hide');
        Router.go('dashboard-selectAction',{_id: Session.get(CURRENT_DASHBOARD_ID)});
    },

    'click .addVariable': function(event, instance) {
        $("#selectWidgetType").modal('hide');
        Router.go('dashboard-selectVariable',{_id: Session.get(CURRENT_DASHBOARD_ID)});
    },

    'click .addFloorPlan': function(event, instance) {
        $("#selectWidgetType").modal('hide');
        Router.go('dashboard-floorPlan',{_id: Session.get(CURRENT_DASHBOARD_ID)});
    }
});


Template.addWidgetSelectWidgetType.onRendered(function () {
    SemanticUI.modal("#selectWidgetType");
});
