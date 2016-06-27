class DataLogger {

    constructor() {
        this.dataToPersist={};
    }

    /*

       <dayTimestamp>: {
                  timestamp : <value>,
                  sum : <value>,
                  count: <value>,
               },
        sum: <value>
        sampleCount: <value>
     */

    eventHandler(driver,device,sensor,value,timestamp) {

        let settings=Settings.get();
        if(!settings.dataLoggingEnabled) return;

        let sensorId=SHARED.getSensorID(driver,device,sensor);
        let sensorEntry=this.dataToPersist[sensorId];
        if(timestamp==undefined) timestamp=new  Date().getTime();

        let meta=Sensors.getSensorStatus(driver,device,sensor);//SensorMetadata.getSensorMetadata(sensorId);
        // unknown sensor, driver problem...
        if(meta===undefined) return;

        if(sensorEntry===undefined)
        {
            sensorEntry={ createdOn: timestamp};
            this.dataToPersist[sensorId]=sensorEntry;
        }

        if(SensorClasses.isAnalog(meta.class)) {
            var smallestUnit=meta.resolution;
            if(smallestUnit===undefined) smallestUnit=0.1;
            value=Math.round(value/smallestUnit)*smallestUnit;
        }

        if (sensorEntry.lastValue===value) return;

        if(SensorClasses.isAnalog(meta.class))
        {
            if(timestamp-sensorEntry.lastTimestamp<1000*60*settings.minimumIntervalBetweenSensorUpdates) return;
        }
        sensorEntry.lastValue=value;
        sensorEntry.lastTimestamp=timestamp;

        let now=moment(timestamp);
        now.set('hour', 0);
        now.set('minute', 0);
        now.set('second', 0);
        now.set('millisecond', 0);
        let dayTimestamp=now.valueOf();
        now.set('day',0);
        let weekTimestamp=now.valueOf();

        let weekEntry=sensorEntry[weekTimestamp];
        if(weekEntry===undefined)
        {
            weekEntry={ weekTimestamp: weekTimestamp };
            sensorEntry[weekTimestamp]=weekEntry;
        }

        var dayEntry=weekEntry[dayTimestamp];
        if(dayEntry===undefined)
        {
            dayEntry={   };
            weekEntry[dayTimestamp]=dayEntry;
        }

        dayEntry[timestamp]=value;/*
        if(dayEntry.sum===undefined) {
            dayEntry.sum=value;
            dayEntry.count=1;
        }
        else
        {
            dayEntry.sum+=value;
            dayEntry.count++;
        }*/
        //log.debug(this.dataToPersist);
    }

    isDate(s) {
        var c=s.charAt(0);
        return c>='0' && c<='9';
    }

    persist() {
        for (var sensorId in this.dataToPersist) {
            var sensorEntry=this.dataToPersist[sensorId];
            for(var weekTimestamp in sensorEntry) {
                if(this.isDate(weekTimestamp))
                {
                    var weekEntry=sensorEntry[weekTimestamp];
                    var values={};
                    var notEmpty=false;
                    for(var dayTimestamp in weekEntry) {
                        if(this.isDate(dayTimestamp))
                        {
                            var dayEntry=weekEntry[dayTimestamp];
                            for(var timestamp in dayEntry) {
                                if(this.isDate(timestamp))
                                {
                                    var value=dayEntry[timestamp];
                                    values['values.'+(dayTimestamp+'.')+timestamp]=value;
                                    notEmpty=true;
                                }
                            }
                        }
                    }
                    delete sensorEntry[weekTimestamp];
                    if(notEmpty) {
                        Collections.LoggedData.directUpdate(
                            {
                                _id: sensorId+';'+weekTimestamp,
                                sensor: sensorId,
                                timestamp: parseInt(weekTimestamp)
                            }
                            ,{$set : values},{validate: false, upsert:true});
                    }
                }
            }
        }
    }

    decimate() {
        var settings=Settings.get();
        var dateLimit=new Date().getTime()-3600*1000*24*settings.dataLoggingHistory;//365;
        Collections.LoggedData.remove({ timestamp: {$lt : dateLimit}});
    }

    fetchData(sensorId, age) {
        var now=moment(age);
        now.set('hour', 0);
        now.set('minute', 0);
        now.set('second', 0);
        now.set('millisecond', 0);
        now.set('day',0);
        var weekTimestamp=now.valueOf();

        var documents=Collections.LoggedData.find({sensor: sensorId, timestamp: {$gte : weekTimestamp}});
        var data={};
        /* data from db */
        documents.forEach(function(doc) {
            for(var dayTimestamp in doc.values) {
               var dayEntry=doc.values[dayTimestamp];
               for(var timestamp in dayEntry) {
                   if(Number(timestamp)>age) data[timestamp]=dayEntry[timestamp];
               }
           }
        });
        /* data not stored yet */
        var sensorEntry=this.dataToPersist[sensorId];
        if(sensorEntry!==undefined)
        {
            for(var weekTimestamp in sensorEntry) {
                if(this.isDate(weekTimestamp))
                {
                    var weekEntry=sensorEntry[weekTimestamp];
                    for(var dayTimestamp in weekEntry) {
                        if(this.isDate(dayTimestamp)) {
                                var dayEntry = weekEntry[dayTimestamp];
                                for (var timestamp in dayEntry) {
                                    if(this.isDate(timestamp)) {
                                        if(Number(timestamp)>age) data[timestamp] = dayEntry[timestamp];
                                    }
                                }
                        }
                    }
                }
            }
        }
        else {
            log.debug('no non-persistent data to process');
        }
        return data;
    }

    clearDataLog() {
        log.info('All recorded sensor values were cleared');
        Collections.LoggedData.remove({});
    }

    startPersistence(settings) {
        var self=this;

        this.persistenceTimer=Meteor.setInterval(function() {
            self.persist();
            self.decimate();
        } ,1000*settings.persistenceInterval);
    }

    applySettings(settings) {
        Meteor.clearInterval(this.persistenceTimer);
        this.startPersistence(settings);
    }

    start() {
        log.info('Starting logger');
        var self=this;
        var settings=Settings.get();
        this.startPersistence(settings);

        Settings.addEventListener({
            onUpdate: function (settings) {
                self.applySettings(settings);
            }
        });

        Sensors.addSensorValueEventListener(function(driver,device,sensor,value,timestamp) { self.eventHandler(driver,device,sensor,value,timestamp); });
        SensorsUI.addEventListener(    {
                onRemove : function(sensorId) {
                    try {
                        Collections.LoggedData.remove({sensor: sensorId});
                    }
                    catch(e)
                    {
                        log.error('Error removing sensor data',e);
                    }
                }
            }
        );
    }
}

DataLoggerInstance=new DataLogger();

