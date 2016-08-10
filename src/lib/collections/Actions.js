Collections.Actions = new Mongo.Collection("actions");

Schemas.Action=new SimpleSchema({
    title: {
        type: String,
        label: "Name",
        max: 64
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    keywords: {
        type: [String],
        label: "Keywords",
        optional: true
    },
    disabled: {
        type: Boolean,
        label: "Disabled",
        optional: true
    },
    executeOnStartup: {
        type: Boolean,
        label: "Execute on System Startup",
        optional: true
    },
    code: {
        label: "Code",
        type: String,
        optional: true
    },
    xml: {
        label: "XML",
        type: String,
        optional: true
    },
    calendarDroppable: {
        label: "Available in Calendar",
        type: Boolean,
        optional: true
    }
});

Collections.Actions.attachSchema(Schemas.Action);