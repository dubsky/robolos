Meteor.publish('allSensorMetadata', function(){
    return Collections.SensorsMetadata.find();
});

Meteor.methods({
    updateSensorMeta: function(meta,documentId) {
        //log.debug('update sensor meta',meta);
        SensorMetadata.updateSensorMeta(documentId,meta);
    }
});

class SensorsUIClass extends Observable {

    removeSensorsOfDevice(driverInstanceId,deviceId) {
        var self=this;
        Sensors.forEachSensor(function(sensor) {
            if(sensor.driver==driverInstanceId && sensor.deviceId==deviceId) {
                let sensorId=SHARED.getSensorID(sensor.driver,sensor.deviceId,sensor.sensorId);
                SensorMetadata.removeSensor(sensorId);
                self.fireRemoveEvent(sensorId);
            }
        });
    }
}

SensorsUI=new SensorsUIClass();

Meteor.publish('sensors', function(filter, reactive){
    var self = this;
    console.log(' subscribing :'+(filter!=undefined ? (filter._id!=undefined ? filter._id : 'no filter id'): 'no filter'));
//log.debug(' subscribing :'+filter!=undefined ? filter._id : 'no filter');
    let subscribedSensors={};
    Sensors.forEachSensor(function(sensor) {
        var sensorId=sensor._id;
        let add=true;
        if(filter!=undefined && filter._id!==undefined) { add=sensorId===filter._id; }
        if(add) {
            subscribedSensors[sensorId]=true;
            var meta=SensorMetadata.getSensorMetadata(sensorId);
            //merge keywords
            let keywords={};
            if((typeof meta)!=='undefined')
            {
                var mergeTarget = sensor;
                for (var attrname in meta) { if(attrname!=='_id' && attrname!=='sensorId'&& attrname!=='keywords') mergeTarget[attrname] = meta[attrname]; }
                if(Array.isArray(meta.keywords)) for(let i=0;i<meta.keywords.length;i++) keywords[meta.keywords[i]]=null;
            }
            if(Array.isArray(sensor.keywords)) for(let i=0;i<sensor.keywords.length;i++) keywords[sensor.keywords[i]]=null;
            sensor.keywords=Object.keys(keywords);
            self.added("sensors", sensorId, sensor);
            log.debug('add!:'+sensorId);

        }
    });

    self.ready();

    if(reactive!==false)
    {
        // listen for value changes
        var listenerId = Sensors.addSensorValueEventListener(function (driver, device, sensor, value, timestamp) {
            var sensorID = SHARED.getSensorID(driver, device, sensor);
            try {
                if (subscribedSensors[sensorID]) {
                    self.changed("sensors", sensorID,
                        {
                            value: value,
                            timestamp: timestamp
                        });
                }
            }
            catch (e) {
                log.error('Error updating sensor value', e);
            }
        });

        // listen for sensor metadata changes
        var metaListenerId=SensorMetadata.addEventListener(function (meta) {
            var id=meta._id;
            var mergeTarget = {};
            for (var attrname in meta) { mergeTarget[attrname] = meta[attrname]; }
            self.changed("sensors",id, mergeTarget);
        });

        // list for sensor creation / removal
        var sensorListenerId=SensorsUI.addEventListener(    {
                onCreate : function(sensor) {
                    self.added("sensors",sensor._id,sensor);
                    subscribedSensors[sensor._id]=false;
                },
                onRemove : function(sensorId) {
                    try {
                        self.removed("sensors",sensorId);
                        delete subscribedSensors[sensorId];
                    }
                    catch(e)
                    {
                        log.error('Error removing sensor from sensor list',e);
                    }
                },
                onUpdate : function(sensor) {
                    try {
                        self.changed("sensors",sensor._id,sensor);
                    }
                    catch(e)
                    {
                        log.error('Error updating sensor information',e);
                    }
                }
            }
        );

        self.onStop(function(){
            SensorsUI.removeEventListener(sensorListenerId);
            Sensors.removeSensorValueEventListener(listenerId);
            SensorMetadata.removeEventListener(metaListenerId);
        });
    }

});

Meteor.methods({
    actionSwitchOver : function(driverInstanceId,deviceId,sensorId) {
        Sensors.performAction(driverInstanceId,deviceId,sensorId,SENSOR_ACTIONS.SWITCH_OVER);
    },


    actionSetValue : function(driverInstanceId,deviceId,sensorId,value) {
        Sensors.performAction(driverInstanceId,deviceId,sensorId,SENSOR_ACTIONS.SET_VALUE,value);
    }

});

