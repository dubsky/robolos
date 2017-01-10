Template.settings.helpers({

    allowServerChange() {
        return Meteor.isCordova || Meteor.isElectron;
    }

});

Router.route('settings',
    function () {
        this.render('settings');
    },
    {
        name: 'settings',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe("settings")];
            });
        }
    }
);




