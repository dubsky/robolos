Collections.Variables=CollectionManager.Collection('variables');
Schemas.Variable=new SimpleSchema({
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
    onChangeAction: {
        label: "On Change Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'fa-random'
        }
    },
    type: {
        type: String,
        allowedValues:['boolean','number','string','date'],
    },
    modifiedBy: {
        label: "Modified by",
        defaultValue: 'user',
        allowedValues:['user','action','both'],
        type: String
    },
    allowAutomaticControl: {
        label: 'Allow Automatic Control',
        defaultValue: true,
        optional: true,
        type: Boolean
    },
    stringValue: {
        label: "Value",
        type: String,
        optional: true
    },
    stringAllowedValues: {
        label: "Allowed Values",
        type: [String],
        optional: true
    },
    numberValue: {
        label: "Value",
        type: Number,
        decimal: true,
        optional: true
    },
    booleanValue: {
        label: "Value",
        type: Boolean,
        optional: true
    },
    dateValue: {
        label: "Value",
        type: Date,
        optional: true
    },
    trueValueLabel: {
        label: "True Value Label",
        type: String,
        optional: true
    },
    falseValueLabel: {
        label: "False Value Label",
        type: String,
        optional: true
    },
    dateBeforeLabel: {
        label: "Before Reached Label",
        defaultValue: 'Disabled Until',
        type: String,
        optional: true
    },
    dateAfterLabel: {
        label: "After Reached Label",
        defaultValue: 'Enabled Since',
        type: String,
        optional: true
    },
    minimum: {
        label: "Minimum Value",
        type: Number,
        decimal : true,
        optional: true
    },
    maximum: {
        label: "Maximum Value",
        type: Number,
        decimal : true,
        optional: true
    },
    unit: {
        label: "Measurement Unit",
        type: String,
        optional: true
    }
});

Collections.Variables.Types=[
    {label: "Boolean", value: 'boolean'},
    {label: "Number", value: 'number'},
    {label: "String", value: 'string'},
    {label: "Date", value: 'date'}
];

Collections.Variables.ModifiedBy=[
    {label: "User Only", value: 'user'},
    {label: "Automatic Action Only", value: 'action'},
    {label: "Both the user and automatic action(s)", value: 'both'}
];

Collections.Variables.DashboardAccessibleFields={'allowAutomaticControl':true,'stringValue':true,'booleanValue':true,'numberValue':true,'dateValue':true};

Collections.Variables.attachSchema(Schemas.Variable);