
class DashboardsUIClass {
    upsertDashboard(id,dashboard) {
        return Collections.Dashboards.upsert(id,dashboard);
    }
}

DashboardsUI=new DashboardsUIClass();

Meteor.publish('dashboards', function(filter,reactive){
    Accounts.checkDashboardAccess(this);
    return Collections.Dashboards.find();
});


function collectWidgetStatuses(subscription, widgets,dashboardCollection,dashboardSensors,dashboardActions,dashboardVariables) {
    if ((typeof widgets) !== 'undefined') {
        for (var i = 0; i < widgets.length; i++) {
            var widget = widgets[i];
            if (widget.type === 'sensor') {
                var sensorID = SHARED.getSensorID(widget.driver, widget.device, widget.sensor);
                dashboardSensors[sensorID] = true;
                var sensorData = Sensors.getSensorStatus(widget.driver, widget.device, widget.sensor);
                var meta = SensorMetadata.getSensorMetadata(sensorID);
                var mergeTarget = {};
                if ((typeof meta) !== 'undefined') {
                    for (var attrname in meta) {
                        if (attrname !== '_id' && attrname !== 'sensorId') mergeTarget[attrname] = meta[attrname];
                    }
                }
                for (var attrname in sensorData) {
                    mergeTarget[attrname] = sensorData[attrname];
                }
                subscription.added(dashboardCollection, sensorID, mergeTarget);
            }

            if (widget.type === 'action') {
                dashboardActions[widget.action] = true;
                var action = ActionsInstance.getAction(widget.action);
                subscription.added(dashboardCollection, widget.action, ActionsUI.cleanAction(action));
            }

            if (widget.type === 'variable') {
                dashboardVariables[widget.variable] = true;
                var variable = VariablesInstance.getVariable(widget.variable);
                subscription.added(dashboardCollection, widget.variable, variable);
            }

            if (widget.type === 'floorPlan') {
                collectWidgetStatuses(subscription,widget.widgets,dashboardCollection,dashboardSensors,dashboardActions,dashboardVariables);
            }

            if(widget.actions!==undefined) {
                for(let i in widget.actions) {
                    let actionId=widget.actions[i];
                    dashboardActions[actionId] = true;
                    var action = ActionsInstance.getAction(actionId);
                    subscription.added(dashboardCollection, actionId, ActionsUI.cleanAction(action));
                }
            }
        }
    }
}

Meteor.publish('sensorStatusCollection', function(parameters){
    Accounts.checkDashboardAccess(this);
    try {
        var dashboardCollection="sensorStatusCollection";
        var self = this;
        var dashboard = Collections.Dashboards.findOne({_id: parameters.id});

        var dashboardSensors = {};
        var dashboardActions = {};
        var dashboardVariables = {};

        collectWidgetStatuses(self,dashboard.widgets,dashboardCollection,dashboardSensors,dashboardActions,dashboardVariables);

        self.ready();
        var listenerId = Sensors.addSensorValueEventListener(function (driver, device, sensor, value, timestamp) {
            var sensorID = SHARED.getSensorID(driver, device, sensor);
            if (dashboardSensors[sensorID]) {
                self.changed(dashboardCollection, sensorID,
                    {
                        value: value,
                        timestamp: timestamp
                    });
            }
        });

        var actionListenerId = ActionsUI.addEventListener({
            onUpdate: function (action) {
                if (dashboardActions[action._id]) {
                    self.changed("sensorStatusCollection", action._id, ActionsUI.cleanAction(action));
                }
            }
        });

        var variableListenerId = VariablesInstance.addEventListener({
            onUpdate: function (variable) {
                if (dashboardVariables[variable._id]) self.changed("sensorStatusCollection", variable._id, variable);
            }
        });

        self.onStop(function () {
            Sensors.removeSensorValueEventListener(listenerId);
            ActionsUI.removeEventListener(actionListenerId);
            VariablesInstance.removeEventListener(variableListenerId);
        });
    }
    catch(e) {
        SHARED.printStackTrace(e);
    }
});

Meteor.methods({
    createDashboard: function(dashboard) {
        Accounts.checkAdminAccess(this);
        var id=Collections.Dashboards.upsert('',dashboard).insertedId;
    },

    deleteDashboard: function(dashboardId) {
        Accounts.checkAdminAccess(this);
        Collections.Dashboards.remove({_id:dashboardId});
    },

    updateDashboard: function(dashboard,dashboardId) {
        Accounts.checkAdminAccess(this);
        Collections.Dashboards.update(dashboardId,dashboard);
    }

});