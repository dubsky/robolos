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
    console.log('edit sensor !!!');
    if(!this.data.create) {
        document.forms['editProperties'].elements['title'].value=this.data.widget.title;
        document.forms['editProperties'].elements['icon'].value=this.data.widget.icon;
        let sensorId=SHARED.getSensorID(this.data.widget.driver,this.data.widget.device,this.data.widget.sensor);

        console.log('subscribe to:',sensorId);
        let sensor=SensorsCollection.findOne(sensorId);
        console.log('s5s '+sensor);
        Template.editSensorWidgetProperties.handle=Meteor.subscribe('sensors',{_id:sensorId },{onStop: function(e) {console.log(e)}, onReady: () => {
            console.log('On ready !!!');
            let sensor=SensorsCollection.findOne(sensorId);
            console.log('s2s '+sensor);
            let name=sensorId;
            if(sensor!==undefined && sensor.name!==undefined) name=sensor.name;
            document.forms['editProperties'].elements['sensor'].value = name;
        }},true);
        console.log('asdf:'+Template.editSensorWidgetProperties.handle.ready());

    }
});

Template.editSensorWidgetProperties.onDestroyed(function() {
    if(!this.data.create) {
        Template.editSensorWidgetProperties.handle.stop();
        Template.editSensorWidgetProperties.handle = undefined;
    }
});
