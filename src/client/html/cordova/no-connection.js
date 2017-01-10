NO_CONNECTION_RECHECK="NO_CONNECTION_RECHECK";

Router.route('no-connection', 'noConnection');

Template.noConnection.helpers({
    allowServerChange() {
        return Meteor.isCordova || Meteor.isElectron;
    }
});

Template.noConnection.events({
    'click .retry': function() {
        Router.go('/');
    },

    'click .changeURL': function() {
        Session.set(NO_CONNECTION_RECHECK,true);
        Router.go('changeServerURL');
    }
});
