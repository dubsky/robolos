Meteor.methods({

    EmailUI_testMessage:function() {
        Accounts.checkAdminAccess(this);
        return NotificationsInstance.sendTestEmail();
    }
});