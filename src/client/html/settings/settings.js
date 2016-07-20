Router.route('settings',
    function () {
        this.render('settings');
    },
    {
        name: 'settings',
        waitOn: function() {
            return [App.subscribe("settings")];
        }
    }
);




