Template.renderSensorValue.helpers({

    value: function() {
        if(this.class===SensorClasses.BINARY_OUTPUT||this.class===SensorClasses.BINARY_INPUT) {
            return this.value===1;
        }
        if((typeof this.value)==='number') {
            var smallestUnit=this.resolution;
            if(smallestUnit===undefined) smallestUnit=0.1;
            let positions=0;
            let unit=smallestUnit;
            while(unit<1) { unit*=10; positions++; }
            return (Math.round(this.value/smallestUnit)*smallestUnit).toFixed(unit);
        }
        return this.value;
    },

    unknown: function() {
       return this.value===undefined;
    },

    binary: function() {
        return this.class===SensorClasses.BINARY_OUTPUT||this.class===SensorClasses.BINARY_INPUT;
    },

    binaryInput: function() {
        return this.class===SensorClasses.BINARY_INPUT;
    },

    analogOutput0100: function() {
        return this.class===SensorClasses.ANALOG_OUTPUT_0_100;
    },

    unit: function() {
        var u=DefaultSensorUnits[this.type];
        if(this.unitOverride!==undefined) return this.unitOverride.replace(/\[deg\]/i, "&deg;");
        if(u===undefined) return ''; else return u;
    },

    renderAsOff:function() {
        return  (this.value===0) ;//&& this.displayZeroAsOff;
    }
});

Template.renderSensorValue.IdGenerator=0;

Template.renderSensorValue.switchOver=function(id,driver,deviceId,sensorId) {
    Meteor.call('actionSwitchOver',driver,deviceId,sensorId);
    console.log($('#'+id));
    $('#'+id).popup('destroy');
};

Template.renderSensorValue.events({
    'click .popupSlider': function(e) {

        if(this.class===SensorClasses.ANALOG_OUTPUT_0_100) {
            var parent=e.toElement.parentNode;
            var location=$(parent);
            var id=Template.renderSensorValue.IdGenerator++;
            var self=this;
            location.get(0).setAttribute('id','popSld'+id);
            console.log('created id:'+'popSld'+id);
            let buttons='<div style="margin-left:20px; position:relative;top:16px" class="ui small basic vertical icon buttons"><button onclick="Template.renderSensorValue.switchOver(\'popSld'+id+'\',\''+self.driver+'\',\''+self.deviceId+'\',\''+self.sensorId+'\')" class="ui compact button"><i class="power tiny icon"></i></button></div>';
            location.popup({
                    hoverable: true,
                    on:'click',
                    position : 'left center',
                    html  : "<div style='width:335px;height:70px'><table><tr><td><div style='width:240px;height:100px;'><input style='display:none' id='rangeSlide"+id+"' type='text' name='nrangeSlide"+id+"' value='' /></div></td><td style='vertical-align: top'>"+buttons+"</td></tr></table></div>",
                    delay: {
                        show: 300,
                        hide: 800
                    },
                    onCreate:function() {
                        $("#rangeSlide"+id).ionRangeSlider({
                            min:0,
                            max:100,
                            grid:true,
                            grid_num:5,
                            from: self.value,
                            hide_min_max:true,
                            force_edges:true,
                            onChange: function (data) {
                                Meteor.call('actionSetValue',self.driver,self.deviceId,self.sensorId,data.from); //console.log("onChange");
                            }
                        });
                    }
                });
            location.popup('show');
        }
    },

    'click .binarySwitch' : function() {
        Meteor.call('actionSwitchOver',this.driver,this.deviceId,this.sensorId);
    }

});