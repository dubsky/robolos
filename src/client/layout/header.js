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

Template.header.helpers({
    renderHeader:function() {
        let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID);
        return Meteor.user()!=null || (settings!=undefined && settings.anonymousAccessToDashboards);
    },

    isWide:function() {
        return isWide()
    },


    isAdministrator : function() {
        return Session.get(USER_ROLE)===Collections.Users.RoleKeys.administrator;
    }

});
