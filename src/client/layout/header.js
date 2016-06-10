Template.header.events({
    "click .signOut": function() {
        AccountsTemplates.logout();
        Router.go('homepage');
    }

});


Template.header.helpers({
    renderHeader:function() {
        let settings=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
        return Meteor.user()!=null || settings.anonymousAccessToDashboards;
    }
});
