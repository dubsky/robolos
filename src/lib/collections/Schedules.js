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
    type: {
        label: "Schedule Type",
        type: String,
        allowedValues:['cron','one-time','value'],
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
        optional: true,
        autoform: {
            icon: 'fa-clock-o'
        }
    },
    'analogValueSchedule.minValue': {
        type: Number,
        label: "Minimum Value",
        defaultValue:0
    },
    'analogValueSchedule.maxValue': {
        type: Number,
        label: "Maximum Value",
        defaultValue:100
    },
    'analogValueSchedule.data': {
        label: "Analog Value Data",
        optional: true,
        blackbox: true,
        type: Object
    }
});

Collections.Schedules.Types=[
    {label: "Recurring", value: 'cron'},
    {label: "Analog Value Daily Schedule", value: 'value'},
    {label: "One Time Calendar Event", value: 'one-time'},
];
Collections.Schedules.attachSchema(Schemas.Schedule);
