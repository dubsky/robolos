class Events {

    constructor() {
        this.controllers={};
    }

    getControllers(sensorId,driver,device,sensor)
    {
        var controllers=this.controllers[sensorId];
        if(controllers===null) return [];
        if((typeof controllers)==='undefined') {
            // check for implicit action controllers
            var meta=SensorMetadata.getSensorMetadata(sensorId);
            //log.debug("meta:"+meta+" / "+sensorId);
            if((typeof meta)==='undefined') {
                this.controllers[sensorId]=null;
                return null;
            }

            var sensorData=Sensors.getSensorStatus(driver,device,sensor);

            if(sensorData.class===SensorClasses.ANALOG_INPUT || sensorData.class===SensorClasses.ANALOG_INPUT_0_100)
            {
                var controller=[new AnalogInputActionController(sensorData,meta)];
                this.controllers[sensorId]=controller;
                return controller;
            }
            if(sensorData.class===SensorClasses.BINARY_INPUT)
            {
                var controller=[new BinaryInputActionController(sensorData,meta)];
                this.controllers[sensorId]=controller;
                return controller;
            }
            this.controllers[sensorId]=null;
            return null;
        }
        return controllers;
    }

    eventHandler(driver,device,sensor,value,timestamp) {
        var sensorId=SHARED.getSensorID(driver,device,sensor);
        var controllers=this.getControllers(sensorId,driver,device,sensor);
        //log.debug("event from:"+sensorId);
        if(controllers==null) return;
        for(var i=0;i<controllers.length;i++)
        {
            var controller=controllers[i];
            controller.event(value,timestamp);
        }
    }

    start() {
        var self=this;
        Sensors.addSensorValueEventListener(function(driver,device,sensor,value,timestamp) { self.eventHandler(driver,device,sensor,value,timestamp); });
    }

}

EventsInstance=new Events();

Meteor.startup(function() {
    EventsInstance.start();
});
