var SESSION_KEY='Template.emailSettings.saved';
var TEST_MESSAGE_STATUS='Template.emailSettings.test';

Template.emailSettings.helpers({

    collection: Collections.Settings,
    schema: Schemas.Settings,

    settings: function() {
        let doc=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
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

Template.emailSettings.events({
    'click .sendTestMessage' : function() {
        Session.set(TEST_MESSAGE_STATUS,'Waiting...');
        Meteor.call('EmailUI_testMessage',function(error,result) { console.log(result); Session.set(TEST_MESSAGE_STATUS,result)});
        return false;
    },

    'click .close' : function() {
        Session.set(TEST_MESSAGE_STATUS,undefined);
    }
});


AutoForm.hooks({
    emailSettingsForm: {
        after: {
            'method-update': function() {
                Session.set(SESSION_KEY,true);//setTimeout(function() {Session.set(SESSION_KEY,true);},100);
            }
        },
        formToModifier: function(modifier) {
            Session.set(SESSION_KEY,false);
            return modifier;
        }
    }
});
