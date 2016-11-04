
Meteor.methods({
    exportDashboards: function(dashboards) {
        console.log('dashboards',dashboards);
        Accounts.checkAdminAccess(this);
        let context={};
        if(dashboards!==undefined)
        for(let dashboardId of dashboards) {
            console.log('processing',dashboardId);
            Export.exportDashboard(context,dashboardId);
        }
        return EJSON.stringify(context,{indent:'\t'});
    },

    importDemoData: function() {
        Accounts.checkAdminAccess(this);
        let data=EJSON.parse(Assets.getText('demoData.json'));
        Import.importData(data);
    }

});

