Template.addUser.helpers({

    schema: new SimpleSchema({
            email: {
                type: String,
                label: "Email",
                optional: false,
                max: 128
            },
            password: {
                type: String,
                label: "Password",
                optional: false,
                max: 128
            }
        })
});

Template.addUser.events({

    'click .cancel' :function(event) {
        Router.go('users');
        return false;
    }

});

Router.route('addUser', function () {
        this.render('addUser');
    }
);

AutoForm.hooks({
    addUserForm: {
        after: {
            'method-update': function() {
                Router.go('users');
            }
        }
    }
});
