var SESSION_KEY='Template.securitySettings.saved';

Template.securitySettings.helpers({

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

Template.securitySettings.onCreated(function() {
    Session.set(SESSION_KEY,true);
});

Template.securitySettings.onRendered(function() {
    let enable=function() {
        Session.set(SESSION_KEY,false);
    };
    let selector=$("#securitySettingsForm :input");
    selector.keyup(enable);
    selector.change(enable);
});

Template.securitySettings.onDestroyed(function() {
    delete Template.securitySettings.modifier;
});

Template.securitySettings.events({

    'click .customSubmit': function() {
        if (AutoForm.validateForm('securitySettingsForm')) {
            Meteor.call('updateSettings',Template.securitySettings.modifier,function() { Session.set(SESSION_KEY,true); });
        }
        return false;
    }
});


AutoForm.hooks({
    securitySettingsForm: {
        formToModifier: function(modifier) {
            Template.securitySettings.modifier=modifier;
            return modifier;
        }
    }
});