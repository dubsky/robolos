Template.leftSideMenu.helpers({
    dashboards: function () {
        return Collections.Dashboards.find({},{sort: ["menuPositionNumber","asc"]});
    },

    isActive: function () {
        if(this._id===undefined) return false;
        if(Router.current().route.getName()==='render.dashboard')
            return this._id===Session.get(CURRENT_DASHBOARD_ID);
        else
            return false;
    },

    isHomepage: function() {
        var routeName = Router.current().route.getName();
        return routeName==='homepage' ? 'active' : '';
    }
});

Template.leftSideMenu.events({
    "click .openDashboard": function() {
        if(Router.current().route.getName()==='render.dashboard') console.log('we are in trouble');
        //$('#sidebarMenu').sidebar('toggle');
        Router.go('render.dashboard.redirect',{_id: this._id});
    }
});