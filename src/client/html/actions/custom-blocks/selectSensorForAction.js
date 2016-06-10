Template.selectSensorForAction.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedSensor');
        return (typeof selection==='undefined') || selection===null;
    }
});

Template.selectSensorForAction.events({

    'click .selectSensor': function(event, instance) {
        var sensor=Session.get('selectedSensor');
        var sensorName=Session.get('selectedSensorName');
        Blockly.FieldSensor.activeBlock.setText(sensorName);
        //console.log(EJSON.stringify({ id: sensor, name: sensorName}));
        if((typeof sensorName)==='undefined') sensorName=sensor;
        Blockly.FieldSensor.activeBlock.setValue(EJSON.stringify({ id: sensor, name: sensorName}));
    }
});

Template.selectSensorForAction.rendered=function() {
    Session.set('selectedSensor',null);
}