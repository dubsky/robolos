var SESSION_KEY='Template.dataLoggingSettings.saved';
var LOG_DATA_CLEARED='Template.dataLoggingSettings.cleared';

Template.dataLoggingSettings.helpers({

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

    logDataCleared: function() {
        return Session.get(LOG_DATA_CLEARED);
    }

});

Template.dataLoggingSettings.onCreated(function() {
    Session.set(SESSION_KEY,true);
    Session.set(LOG_DATA_CLEARED,false);
});

Template.dataLoggingSettings.events({
    'click .clearLogData' : function() {
        Meteor.call('DataLoggingUI_clearData',function() {
            Session.set(LOG_DATA_CLEARED, true);
        });
        return false;
    }
});


AutoForm.hooks({
    dataLoggingSettingsForm: {
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
