Collections.Schedules=new Mongo.Collection('schedules');
Schemas.Schedule=new SimpleSchema({
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
    cron: {
        label: "Schedule",
        type: [String],
        optional: true
    },
    executeOn: {
        label: "Execute On",
        type: Date,
        optional: true
    },
    action: {
        label: "Action",
        type: String,
        autoform: {
            icon: 'fa-clock-o'
        }
    }
});

Collections.Schedules.attachSchema(Schemas.Schedule);
