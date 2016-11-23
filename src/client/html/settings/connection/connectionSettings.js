var SESSION_KEY='Template.connectionSettings.saved';

Template.connectionSettings.helpers({


    settings: function() {
        let doc=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID,{reactive:false});
        Schemas.Settings.clean(doc);
        return doc;
    },

    saveDisabled: function() {
        return Session.get(SESSION_KEY);
    },

});

Template.connectionSettings.onCreated(function() {
    Session.set(SESSION_KEY,true);
});

Template.connectionSettings.onRendered(function() {
    let enable=function() {
        Session.set(SESSION_KEY,false);
    };
    let selector=$("#connectionSettingsForm :input");
    selector.keyup(enable);
    selector.change(enable);
});


Template.connectionSettings.events({
    'click .customSubmit': function() {
    }
});

