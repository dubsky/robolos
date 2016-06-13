var CURRENT_DASHBOARD="CURRENT_DASHBOARD";

Template.viewDashboard.helpers({

    collection: function() {
        return Collections.Dashboards
    },

    schema: Schemas.Dashboard


});


Router.route('dashboard-properties/:_id',
    function () {
        var self=this;
        var params = self.params;
        var item = Collections.Dashboards.findOne({_id: params._id });
        if(item==null) {
            self.render('notFound');
            return;
        }
        Session.set(CURRENT_DASHBOARD, item);
        self.render('viewDashboard',{data: { dashboard: item }});
    },
    {
        name: 'render.dashboard.properties',
        waitOn: function() {
            return App.subscribe('dashboards');
        }
    }
);

Template.viewDashboard.events({

    'click .cancel' :function(event) {
        Router.go('dashboards');
        return false;
    },

    'click .viewContent' :function(event) {
        Session.set(DASHBOARD_EDIT_MODE,true);
        Router.go('render.dashboard', { _id: Session.get(CURRENT_DASHBOARD)._id });
        return false;
    }
});

AutoForm.hooks({
    viewDashboardForm: {
        after: {
            'method-update': function() {
                if(EditContext.getContext()!==undefined) {
                    Router.go('render.dashboard', { _id: Session.get(CURRENT_DASHBOARD)._id });
                }
                else {
                    Router.go('dashboards');
                }
            }
        }
    }
});