Collections.Dashboards=CollectionManager.Collection('dashboards');
Schemas.Dashboard=new SimpleSchema({
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
    menuPositionNumber: {
        label: "Menu Position",
        optional: true,
        min:1,
        max:1000,
        type: Number
    },
    widgets: {
        label: "Widgets",
        optional: true,
        blackbox: true,
        type: [Object]
    },
    geometry: {
        label: "Geometry",
        optional: true,
        blackbox: true,
        type: [Object]
    }
});

Collections.Dashboards.attachSchema(Schemas.Dashboard);
