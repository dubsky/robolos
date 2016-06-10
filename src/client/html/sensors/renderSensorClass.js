Template.renderSensorClass.helpers({

    name: function() {
        if((typeof this.class)==='undefined'|| this.class===null || this.class==='') return "N/A";
        return SensorClassNames[this.class];
    }

});