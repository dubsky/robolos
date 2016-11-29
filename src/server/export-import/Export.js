import xml2js from 'xml2js';

class ExportClass {

    traverseActionDOM(context,dom) {
        if(dom==undefined) return;
        if(Array.isArray(dom)) {
            for(let a of dom)  this.traverseActionDOM(context,a);
            return;
        }

        if(dom.$!=undefined && dom.$.name !=undefined)
        {
            let t=dom.$.name;
            switch(t) {
                case 'selectedSensor':
                    info=JSON.parse(dom._);
                    this.exportSensor(context,info.id);
                    return;
                case 'selectedVariable':
                    info=JSON.parse(dom._);
                    this.exportVariable(context,info.id);
                    return;
                case 'selectedSchedule':
                    info=JSON.parse(dom._);
                    this.exportSchedule(context,info.id);
                    return;
                case 'selectedAction':
                    info=JSON.parse(dom._);
                    this.exportAction(context,info.id);
                    return;
            }
        }

        for(let t in dom) {
            if((typeof dom[t])==='object') {
                this.traverseActionDOM(context,dom[t]);
            }
        }
    }

    exportActionSchedules(context,id) {
        Collections.Schedules.find({action: id}).forEach(
            (schedule) => {
                this.exportSchedule(context,schedule._id);
            }
        )
    }

    exportAction(context,id) {
        if (context.actions===undefined) context.actions={};
        if(context.actions[id]===undefined) {
            let action = Collections.Actions.findOne(id);
            if (action === undefined) return;
            context.actions[id]=action;
            this.exportActionSchedules(context,id);
            let xml = action.xml;
            if (xml !== undefined) {
                let parse = Meteor.wrapAsync(xml2js.parseString);
                let dom = parse(xml);
                this.traverseActionDOM(context,dom);
                //console.log(dom.xml.block);
            }
        }
    }

    exportVariable(context,id) {
        if (context.variables===undefined) context.variables={};
        if(context.variables[id]===undefined)
        {
            let variable=Collections.Variables.findOne(id);
            if(variable!==undefined) {
                context.variables[id]=variable;
                this.exportAction(context,variable.onChangeAction);
            }
        }
    }

    exportDriver(context,id) {
        if (context.driverInstances===undefined) context.driverInstances={};
        if(context.driverInstances[id]===undefined)
        {
            let driver=Collections.DriverInstances.findOne(id);
            if(driver!==undefined) {
                context.driverInstances[id]=driver;
            }
        }
    }

    exportSensor(context,id) {
        let idComponents=Sensors.getSensorIdComponents(id);
        if (context.sensors===undefined) context.sensors={};
        if(context.sensors[id]===undefined)
        {
            this.exportDriver(context,idComponents[0]);
            let sensorMeta=Collections.SensorsMetadata.findOne(id);
            if(sensorMeta!==undefined) {
                context.sensors[id]={
                    meta: sensorMeta
                };
                let status=Sensors.getSensorStatus(idComponents[0],idComponents[1],idComponents[2]);
                if(status!==undefined)
                {
                    context.sensors[id]._id=id;
                    context.sensors[id].class=status.class;
                    context.sensors[id].type=status.type;
                }
                this.exportAction(context,sensorMeta.turnOnAction);
                this.exportAction(context,sensorMeta.delayTurnOnAction);
                this.exportAction(context,sensorMeta.turnOffAction);
                this.exportAction(context,sensorMeta.holdAction);
                this.exportAction(context,sensorMeta.doubleClickAction);
                this.exportAction(context,sensorMeta.fallsBelowAction);
                this.exportAction(context,sensorMeta.raisesAboveAction);
                this.exportAction(context,sensorMeta.onChangeAction);
            }
        }
    }

    exportSchedule(context,id) {
        if (context.schedules===undefined) context.schedules={};
        if(context.schedules[id]===undefined)
        {
            let schedule=Collections.Schedules.findOne(id);
            if(schedule!==undefined) {
                context.schedules[id]=schedule;
                this.exportAction(context,schedule.onChangeAction);
            }
        }
    }

    exportWidgets(context,widgets) {
        console.log('exporting w',widgets);
        for (w of widgets) {
            switch(w.type) {
                case 'variable':
                    this.exportVariable(context,w.variable);
                    break;
                case 'action':
                    this.exportAction(context,w.action);
                    break;
                case 'sensor':
                    this.exportSensor(context,SHARED.getSensorID(w.driver,w.device,w.sensor));
                    break;
                case 'floorPlan':
                    this.exportWidgets(context,w.widgets);
                    break;

            }
        }
    }


    exportIcon(context,fileId) {
        if(id.startsWith(BUILT_IN_PREFIX)) return;
        console.log('file id:',fileId);
        var gridStore = new GridStore(Collections.Uploads.rawDatabase(), fileId, 'r');
        GridStore.exist(Collections.Uploads.rawDatabase(), fileId, (err, result) => {
            if(!result) {
                return;
            }
            gridStore.open((err, gs) => {
                var stream = gs.stream(true);
                stream.pipe(this.response);
            });
        });
    }


    exportDashboard(context,id) {
        if (context.dashboards===undefined) context.dashboards={};
        if(context.dashboards[id]===undefined)
        {
            let dashboard=Collections.Dashboards.findOne(id);
            if(dashboard!==undefined) {
                context.dashboards[id] = dashboard;
                if (dashboard.widgets !== undefined) {
                    this.exportWidgets(context, dashboard.widgets);
                }
            }
        }
    }

}

Export=new ExportClass();