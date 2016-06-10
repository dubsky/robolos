Template.renderSensorName.helpers({

    name: function() {
        if((typeof this.name)==='undefined'|| this.name===null || this.name==='') return SHARED.getSensorID(this.driver,this.deviceId,this.sensorId);
        return this.name;
    }

});
