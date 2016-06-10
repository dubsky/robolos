Template.addDashboard.helpers({

    collection: function() {
        return Collections.Dashboards
    },

    schema: function() {
        return Schemas.Dashboard
    },

});


Template.addDashboard.events({

    'click .cancel' :function(event) {
        Router.go('dashboards');
        return false;
    }

});


Router.route('dashboard-create', function () {
    this.render('addDashboard');
}, { name: 'addDashboard'});


AutoForm.hooks({
    addDashboardForm: {
        after: {
            'method-update': function() {
                Router.go('dashboards');
            }
        }
    }
});
