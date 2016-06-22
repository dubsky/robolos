Template.header.events({
    "click .signOut": function() {
        AccountsTemplates.logout();
        Router.go('homepage');
    }
    /*
    ,
    "click .item": function() {
        "use strict";
        console.log($('.managementMenu'));
        $('.managementMenu').dropdown('hide');
        //$('.managementMenu').dropdown('set visible');
        return true;
    }*/
});


Template.header.helpers({
    renderHeader:function() {
        let settings=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
        return Meteor.user()!=null || (settings!=undefined && settings.anonymousAccessToDashboards);
    }
});
