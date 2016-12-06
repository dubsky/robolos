var SESSION_KEY='Template.emailSettings.saved';
var TEST_MESSAGE_STATUS='Template.emailSettings.test';

Template.emailSettings.helpers({

    collection: Collections.Settings,
    schema: Schemas.Settings,

    settings: function() {
        let doc=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID,{reactive:false});
        Schemas.Settings.clean(doc);
        return doc;
    },

    saveDisabled: function() {
        return Session.get(SESSION_KEY);
    },

    message: function() {
        return Session.get(TEST_MESSAGE_STATUS);
    }

});

Template.emailSettings.onCreated(function() {
    Session.set(SESSION_KEY,true);
    Session.set(TEST_MESSAGE_STATUS,undefined);
});

Template.emailSettings.onRendered(function() {
    let enable=function() {
        Session.set(SESSION_KEY,false);
    };
    let selector=$("#emailSettingsForm :input");
    selector.keyup(enable);
    selector.change(enable);
});

Template.emailSettings.onDestroyed(function() {
    delete Template.emailSettings.modifier;
});

Template.emailSettings.events({
    'click .sendTestMessage' : function() {
        Session.set(TEST_MESSAGE_STATUS,'Waiting...');
        ConnectionManager.call('EmailUI_testMessage',function(error,result) { console.log(result); Session.set(TEST_MESSAGE_STATUS,result)});
        return false;
    },

    'click .close' : function() {
        Session.set(TEST_MESSAGE_STATUS,undefined);
    },

    'click .customSubmit': function() {
        if (AutoForm.validateForm('emailSettingsForm')) {
            ConnectionManager.call('updateSettings',Template.emailSettings.modifier,function() { Session.set(SESSION_KEY,true); });
        }
        return false;
    }
});


AutoForm.hooks({
    emailSettingsForm: {
        formToModifier: function(modifier) {
            Template.emailSettings.modifier=modifier;
            return modifier;
        }
    }
});
