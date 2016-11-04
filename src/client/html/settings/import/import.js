let DEMO_IMPORTED='Template.import.demo';

Template.import.helpers({

    demoDisabled: function() {
        return Session.get(DEMO_IMPORTED);
    }

});

Template.import.onCreated(function() {
    Session.set(DEMO_IMPORTED,false);
});


Template.import.events({
    'click .importDemoData' : function() {
        Session.set(DEMO_IMPORTED, true);
        Meteor.call('importDemoData',function(e) {
            console.log(e);
        });
        return false;
    }
});
