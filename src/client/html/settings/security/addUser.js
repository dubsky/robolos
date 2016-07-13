let CreateUserSchema=new SimpleSchema({
    email: {
        type: String,
        label: "Email",
        optional: false,
        max: 128,

        custom: function() {
            if (this.isSet) {
                Meteor.call("isEmailUsed", this.value, function(error, result) {
                    if (result) {
                        CreateUserSchema.namedContext('addUserForm').addInvalidKeys([{
                            name: "email",
                            type: "notUnique"
                        }]);
                    }
                });
            }
        },
    },
    password: {
        type: String,
        label: "Password",
        optional: false,
        min:6,
        max: 128
    },
    role: {
        label: "Role",
        defaultValue: 'Observer',
        allowedValues:['Observer','Administrator'],
        type: String
    },
    receivesNotifications: {
        label: "Receives Notifications",
        defaultValue: true,
        type: Boolean
    }
});

Template.addUser.helpers({
    schema: CreateUserSchema,
    roleOptions: function () {
        return Collections.Users.Roles;
    }
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
            'method': function() {
                Router.go('users');
            }
        }
    }
});
