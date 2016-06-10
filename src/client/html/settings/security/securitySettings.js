var SESSION_KEY='Template.securitySettings.saved';

Template.securitySettings.helpers({

    collection: Collections.Settings,
    schema: Schemas.Settings,

    settings: function() {
        let doc=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
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

Template.securitySettings.events({


});


AutoForm.hooks({
    securitySettingsForm: {
        after: {
            'method-update': function() {
                setTimeout(function() {Session.set(SESSION_KEY,true);},100);
            }
        },
        formToModifier: function(modifier) {
            Session.set(SESSION_KEY,false);
            return modifier;
        }
    }
});