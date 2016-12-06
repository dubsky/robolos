Collections.DriverInstances=CollectionManager.Collection('driverInstances');

Schemas.DriverInstance=new SimpleSchema({
    title: {
        type: String,
        label: "Name",
        max: 64
    },
    keywords: {
        type: [String],
        label: "Keywords",
        optional: true
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    driver: {
        label: "Driver",
        type: String
    },
    properties: {
        label: "Driver Parameters",
        optional: true,
        blackbox: true,
        type: Object
    }
});

Collections.DriverInstances.attachSchema(Schemas.DriverInstance);
