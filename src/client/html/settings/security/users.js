Template.users.helpers({

    users: function () {
        return UserCollection.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            {key: 'username', label:'User Name',tmpl: Template.userNameField},
            {key: 'role', label:'Role'},
            {key: 'createdAt', label:'Created At' },
            {key:'emails', label:'Email', tmpl: Template.emailField}
        ],
        filters: ['table-text-search']
    },

    emptySelection : function() {
        var selection=Session.get('selectedUsers');
        return (typeof selection==='undefined') || selection.length===0;
    }
});


Template.users.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedUsers',event, instance,id);
    },

    'click .addUser': function(event, instance) {
        Router.go('addUser');
    },

    'click .removeUsers': function(event, instance) {
        var selection=Session.get('selectedUsers');
        if((typeof selection)!=='undefined') {
            ConnectionManager.call('deleteUsers',selection);
        }
    }

});


Template.users.onRendered(function() {
    Session.set('selectedUsers',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.users.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});


Router.route('users',
    function () {
        this.render('users');
    },
    {
        name: 'users',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe("userAccounts")];
            });
        }
    }
);