class ImportClass {

    importSensors(context) {
        if(context.sensors===undefined) context.sensors={};
        for(let sensorId in context.sensors) {
            let sensor=context.sensors[sensorId];
            let idComponents=Sensors.getSensorIdComponents(sensor._id);
            let status=Sensors.getSensorStatus(idComponents[0],idComponents[1],idComponents[2]);
            if(status!==undefined)
            {
                if(sensor.meta!=undefined) {
                    SensorsUI.upsertSensorMeta(sensor._id,{ $set: sensor.meta });
                }
            }
        }
    }

    importDriverInstances(context) {
        if(context.driverInstances===undefined) context.driverInstances={};
        for(let driverInstanceId in context.driverInstances) {
            let driverInstance=context.driverInstances[driverInstanceId];
            DriverInstancesUI.upsertDriverInstance(driverInstance._id,{ $set: driverInstance });
        }
    }

    importActions(context) {
        if(context.actions===undefined) context.actions={};
        for(let actionId in context.actions) {
            let action=context.actions[actionId];
            ActionsUI.upsertAction(action._id,{ $set: action });
        }
    }

    importVariables(context) {
        if(context.variables===undefined) context.variables={};
        for(let variableId in context.variables) {
            let variable=context.variables[variableId];
            VariablesUI.upsertVariable(variable._id,{ $set: variable });
        }
    }

    importDashboards(context) {
        if(context.dashboards===undefined) context.dashboards={};
        for(let dashboardId in context.dashboards) {
            let dashboard=context.dashboards[dashboardId];
            DashboardsUI.upsertDashboard(dashboard._id,{ $set: dashboard });
        }
    }

    importData(context) {
        this.importSensors(context);
        this.importDriverInstances(context);
        this.importActions(context);
        this.importVariables(context);
        this.importDashboards(context);
    }

}

Import=new ImportClass();