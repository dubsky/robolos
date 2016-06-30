Template.editSensorWidgetProperties.helpers({
    selectedIcon : function() {
        if(this.widget) return this.widget.icon;
    }
});

Template.editSensorWidgetProperties.events({

    'click .updateProperties': function(event, instance) {

        $('#editWidgetProperties').modal('hide');
        let selection=Session.get('selectedSensor');
        let dashboard=Session.get(CURRENT_DASHBOARD);
        let widgets=EditWidgetProperties.getWidgetsCollection(dashboard);

        if(this.create)
        {
            var sensor=selection.split(';');
            widgets.push({
                id : (new Mongo.ObjectID()).toHexString(),
                title: document.forms['editProperties'].elements['title'].value,
                icon: document.forms['editProperties'].elements['icon'].value,
                type: 'sensor',
                driver: sensor[0],
                device: sensor[1],
                sensor: sensor[2]
            });
        }
        else
        {
            let widget=EditWidgetProperties.getWidget(dashboard,this.widget.id);
            widget.icon=document.forms['editProperties'].elements['icon'].value;
            widget.title=document.forms['editProperties'].elements['title'].value;
        }

        EditWidgetProperties.updateDashboard(dashboard);
    },

    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }
});


Template.editSensorWidgetProperties.onRendered(function() {
    SemanticUI.modal("#editWidgetProperties");
    if(!this.data.create) {
        document.forms['editProperties'].elements['title'].value=this.data.widget.title;
        document.forms['editProperties'].elements['icon'].value=this.data.widget.icon;
        let sensorId=SHARED.getSensorID(this.data.widget.driver,this.data.widget.device,this.data.widget.sensor);
        let sensor=SensorsCollection.findOne(sensorId);
        console.log(this);
        let name=sensorId;
        if(sensor!==undefined && sensor.name!==undefined) name=sensor.name;
        document.forms['editProperties'].elements['sensor'].value = name;

    }
});