let CONNECTION_SAVED_SESSION_KEY='Template.connectionSettings.saved';

Template.connectionSettings.helpers({


    settings: function() {
        return ClientConfiguration.get();
    },

    saveDisabled: function() {
        return Session.get(CONNECTION_SAVED_SESSION_KEY);
    },

    baseURL() {
        return ClientConfiguration.getServerBaseUrl();
    }
});

Template.connectionSettings.onCreated(function() {
    Session.set(CONNECTION_SAVED_SESSION_KEY,true);
});

Template.connectionSettings.onRendered(function() {
    let enable=function() {
        Session.set(CONNECTION_SAVED_SESSION_KEY,false);
    };
    let selector=$("#connectionSettingsForm :input");
    selector.keyup(enable);
    selector.change(enable);
});


Template.connectionSettings.events({
    'click .customSubmit': function() {
        console.log($('#serverBaseURL').val());
        let c=ClientConfiguration.get();
        c.baseURL=$('#serverBaseURL').val();
        ClientConfiguration.set(c);
        Session.set(NO_CONNECTION_RECHECK,false);
        window.location.href='/';
        return false;
    }
});

