Router.route('settings',
    function () {
        this.render('settings');
    },
    {
        name: 'settings',
        waitOn: function() {
            // subscribe to just the current one!!!!
            //var dashboardId=Session.get(CURRENT_DASHBOARD_ID);
            //return [Meteor.subscribe('allDashboards'),Meteor.subscribe('sensorStatusCollection',{id: dashboardId })];
            return Meteor.subscribe('settings');
        }
    }
);


Tracker.autorun(function () {
    Meteor.subscribe('settings');
});


