Router.route('no-connection', 'noConnection');

Template.noConnection.events({
    'click .retry': function() {
        Router.go('/');
    }
});
