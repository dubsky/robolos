Template.sensorContent.helpers({

    isSensorType : function(sensorData, type) {
        if((typeof sensorData)==='undefined') return false;
        //console.log(sensorData);
        var calculated='GENERIC_SENSOR';
        switch (sensorData.type) {
            case SensorTypes.S_ANALOG_OUTPUT_0_100.id:
                calculated='ANALOG_OUTPUT_0_100';
                break;
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
