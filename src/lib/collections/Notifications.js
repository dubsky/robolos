Collections.Notifications=new Mongo.Collection('notifications');

Schemas.Notifications=new SimpleSchema({
    pendingNotifications: {
        type: [Object],
        label: "Pending Notifications",
        optional: true
    },
    'pendingNotifications.$.timestamp': {
        type: Date,
        label: "Timestamp"
    },
    'pendingNotifications.$.subject': {
        type: String,
        label: "Subject"
    },
    'pendingNotifications.$.body': {
        type: String,
        label: "Body",
        optional: true
    },
    'pendingNotifications.$.severity': {
        type: String,
        label: "Severity",
        optional: true
    }
});

Collections.Notifications.attachSchema(Schemas.Schedule);
Collections.Notifications.Severity={ info: "INFO", warning: "WARNING", emergency: "EMERGENCY"};
Collections.Notifications.SeverityLabels={ "INFO": "info", "WARNING" : "warning", "EMERGENCY":"emergency" };

Collections.Notifications.Urgency={ immediately: "IMMEDIATELY", daily: "DAILY"};

Collections.Notifications.NOTIFICATIONS_DOCUMENT_ID='NOTIFICATIONS_DOCUMENT';



