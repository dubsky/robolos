Collections.LoggedData=new Mongo.Collection('datalog');
Schemas.LoggedData=new SimpleSchema({
    sensor: {
        type: String,
        index: 1,
        label: "Sensor"
    },
    timestamp: {
        type: Number,
        index: 1,
        label: "Timestamp",
    },
    values: {
        label: "Values",
        blackbox: true,
        type: Object
    }
});

Collections.LoggedData.attachSchema(Schemas.LoggedData);