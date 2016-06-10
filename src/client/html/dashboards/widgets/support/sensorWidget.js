// cant' use dynamic template - reactivity doesn't work then


Template.sensorWidget.helpers({

    sensorData : function() {
        var id=SHARED.getSensorID(this.widget.driver,this.widget.device,this.widget.sensor);
        var sensorData=SensorStatusCollection.findOne(id);
        return sensorData;
    },

    isSensorType : function(sensorData, type) {
        if((typeof sensorData)==='undefined') return false;
        //console.log(sensorData);
       var calculated='GENERIC_SENSOR';
       switch (sensorData.type) {
           case SensorTypes.S_LIGHT.id:
           case SensorTypes.BINARY_OUTPUT.id:
               calculated='BINARY_OUTPUT';
               break;
           case SensorTypes.S_TEMP.id:
               calculated='S_TEMP';
               break;
       }
       return calculated===type;
    }

});