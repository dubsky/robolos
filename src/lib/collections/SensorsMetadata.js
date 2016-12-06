Collections.SensorsMetadata=CollectionManager.Collection('sensorsMetadata');
Schemas.SensorsMetadata=new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        optional: true,
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
    unitOverride: {
        label: "Measurement Unit (use [deg] to show degrees symbol)",
        optional: true,
        type: String
    },
    resolution: {
        label: "Smallest measurable unit",
        defaultValue: 0.1,
        min : 0,
        decimal: true,
        optional: true,
        type: Number
    },
    reversedLogic: {
        label: "Reversed Logic (True or 1 means off, False or 0 means on)",
        optional: true,
        type: Boolean
    },
    turnOnAction: {
        label: "Turn On Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'arrow circle outline up'
        }
    },
    delayTurnOnAction: {
        label: "Do not raise \"Turn On Action\" on Hold/Double Click",
        type: Boolean,
        optional: true
    },
    turnOffAction: {
        label: "Turn Off Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'arrow circle outline down'
        }
    },
    holdAction: {
        label: "Hold >3s Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'history'
        }
    },
    doubleClickAction: {
        label: "Double Click Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'pointing up'
        }
    },
    sensitivity: {
        label: "Sensitivity",
        optional: true,
        type: Number,
        min: 0,
        decimal: true
    },
    fallsBelowValueLimit: {
        label: "Falls Below Value Limit",
        optional: true,
        type: Number,
        decimal: true
    },
    raisesAboveValueLimit: {
        label: "Raises Above Value Limit",
        optional: true,
        type: Number,
        decimal: true
    },

    fallsBelowAction: {
        label: "Falls Below Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'arrow circle outline up'
        }
    },

    raisesAboveAction: {
        label: "Raises Above Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'arrow circle outline down'
        }
    },

    onChangeAction: {
        label: "On Change Action",
        type: String,
        optional: true,
        autoform: {
            icon: 'fa-random'
        }
    },
    canBeControlledRemotely : {
        label: "Allow Remote Control",
        type: Boolean,
        optional: true
    },
    remoteControlLabel: {
        label: "Call name",
        type: String,
        optional: true
    },
    uuid: {
        label: "UUID (for external integrations)",
        type: String,
        optional: true
    }
});

Collections.SensorsMetadata.attachSchema(Schemas.SensorsMetadata);
