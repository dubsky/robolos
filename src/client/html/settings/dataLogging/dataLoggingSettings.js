var SESSION_KEY='Template.dataLoggingSettings.saved';
var LOG_DATA_CLEARED='Template.dataLoggingSettings.cleared';

Template.dataLoggingSettings.helpers({

    collection: Collections.Settings,
    schema: Schemas.Settings,

    settings: function() {
        let doc=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID,{reactive:false});
        //Schemas.Settings.clean(doc);
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

Template.dataLoggingSettings.onRendered(function() {
    let enable=function() {
        Session.set(SESSION_KEY,false);
    };
    let selector=$("#dataLoggingSettingsForm :input");
    selector.keyup(enable);
    selector.change(enable);
});

Template.dataLoggingSettings.onDestroyed(function() {
    delete Template.dataLoggingSettings.modifier;
});

Template.dataLoggingSettings.events({
    'click .clearLogData' : function() {
        ConnectionManager.call('DataLoggingUI_clearData',function() {
            Session.set(LOG_DATA_CLEARED, true);
        });
        return false;
    },

    'click .customSubmit': function() {
        if (AutoForm.validateForm('dataLoggingSettingsForm')) {
            ConnectionManager.call('updateSettings',Template.dataLoggingSettings.modifier,function() { Session.set(SESSION_KEY,true); });
        }
        return false;
    }
});

AutoForm.hooks({
    dataLoggingSettingsForm: {
        formToModifier: function(modifier) {
            Template.dataLoggingSettings.modifier=modifier;
            return modifier;
        }
    }
});
