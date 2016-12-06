Template.header.events({
    "click .signOut": function() {
        AccountsTemplates.logout();
        Router.go('homepage');
    },

    "click .signIn": function() {
        Router.go('atSignIn');
    },

    "click .closeOnClk":function(e) {
        $('.mainDrop').dropdown('hide');
    }
});


isWide=function() { return $(window).width()> 700;};

requireUserLogin=function () {
    let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID);
    if(settings==undefined) return true;
    return settings.requireUserLogin!==undefined && settings.requireUserLogin;
};

Template.header.helpers({
    renderHeader:function() {
        let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID);
        return settings!=undefined && (Meteor.user()!=null || (settings.requireUserLogin===undefined || !settings.requireUserLogin) || (settings!=undefined && settings.anonymousAccessToDashboards));
    },

    isWide:function() {
        return isWide()
    },

    allowManagement : function() {
        return !requireUserLogin() || Session.get(USER_ROLE)===Collections.Users.RoleKeys.administrator;
    },

    allowSignIn : function() {
        return requireUserLogin();
    },

    isActive: function () {
        if(this._id===undefined) return false;
        if(Router.current().route.getName()==='render.dashboard')
            return this._id===Session.get(CURRENT_DASHBOARD_ID);
        else
            return false;
    },
    dashboards: function () {
        return Collections.Dashboards.find({},{sort: ["menuPositionNumber","asc"]});
    },

    loggedIn() {
        return Meteor.userId()!==null;
    }

});
