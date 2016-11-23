import uuid from 'uuid';

/*
SensorMetadata are merged into sensor object for the client
 */
SensorMetadata={

    cache: {},
    initialized: false,

    listeners : {
        listenerObjects: [],
        idGenerator:0
    },

    init: function() {
        //log.debug(":wipe:");
        //Collections.SensorsMetadata.remove({});
        var c=Collections.SensorsMetadata.find();
        var self=this;
        c.forEach(function(d) {
            self.cache[d._id]=d;
        });
        this.initialized=true;
    },

    getSensorMetadata: function(sensorId) {
        if(!this.initialized) this.init();
        return this.cache[sensorId];
    },

    updateSensorMeta: function(docId,meta) {
        var oldMetaFromDb=Collections.SensorsMetadata.findOne(docId);
        if(oldMetaFromDb===undefined) oldMetaFromDb={};
        // auto assigne uuid for sensor for remote integrations that require it
        if(oldMetaFromDb.uuid===undefined) {
            if(meta.$set ===undefined) meta.$set={};
            meta.$set.uuid=uuid.v1()
        }
        Collections.SensorsMetadata.upsert(docId,meta);
        var metaFromDb=Collections.SensorsMetadata.findOne(docId);
        // when we change reversed logic we have to change the interpretation of the current value as well
        if((metaFromDb.reversedLogic && oldMetaFromDb.reversedLogic===undefined)||(oldMetaFromDb.reversedLogic!==metaFromDb.reversedLogic))
        {
            Sensors.invertSensorValueOnReveresedLogicChange.apply(Sensors,docId.split(';'));
        }

        this.cache[docId]=metaFromDb;
        for(var i=0;i<this.listeners.listenerObjects.length;i++) {
            this.listeners.listenerObjects[i](metaFromDb);
        }
    },

    addEventListener : function(listener) {
        var id=this.listeners.idGenerator++;
        this.listeners.listenerObjects[id]=listener;
    },

    removeEventListener : function(id) {
        delete this.listeners.listenerObjects[id];
    },

    removeSensor: function(sensorId) {
        var meta=this.cache[sensorId];
        if((typeof meta)==='undefined') return;
        Collections.SensorsMetadata.remove({_id: sensorId});
        delete meta;
    }

};
