Meteor.methods({

    EmailUI_testMessage:function() {
        return NotificationsInstance.sendTestEmail();
    }
});