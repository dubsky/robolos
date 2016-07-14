var SESSION_KEY='Template.logSettings.saved';

Template.logSettings.helpers({

    collection: Collections.Settings,
    schema: Schemas.Settings,

    settings: function() {
        let doc=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID,{reactive:false});
        Schemas.Settings.clean(doc);
        return doc;
    },

    saveDisabled: function() {
        return Session.get(SESSION_KEY);
    }
});

Template.logSettings.onCreated(function() {
    Session.set(SESSION_KEY,true);
});

Template.logSettings.onRendered(function() {
    let enable=function() {
        Session.set(SESSION_KEY,false);
    };
    let selector=$("#logSettingsForm :input");
    selector.keyup(enable);
    selector.change(enable);
});

Template.logSettings.onDestroyed(function() {
    delete Template.logSettings.modifier;
});

Template.logSettings.events({
    'click .customSubmit': function() {
        if (AutoForm.validateForm('logSettingsForm')) {
            Meteor.call('updateSettings',Template.logSettings.modifier,function() { Session.set(SESSION_KEY,true); });
        }
        return false;
    }

});

AutoForm.hooks({
    logSettingsForm: {
        formToModifier: function(modifier) {
            Template.logSettings.modifier=modifier;
            return modifier;
        }
    }
});


