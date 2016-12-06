let CURRENT_USER_ID='VIEW_USER_CURRENT_USER_ID';

let ViewUserSchema=new SimpleSchema({
    _id: {
        type: String,
        optional: true,
    },
    password: {
        type: String,
        label: "Password",
        optional: true,
        min:6,
        max: 128
    },
    role: {
        label: "Role",
        optional: true,
        type: String
    },
    receivesNotifications: {
        label: "Receives Notifications",
        defaultValue: true,
        type: Boolean
    }
});

Template.viewUser.helpers({
    schema: ViewUserSchema,

    name: function() {
        return UserCollection.getUserName(UserCollection.findOne(Session.get(CURRENT_USER_ID)));
    },

    isSelfEdit: function() {
        return Session.get(CURRENT_USER_ID)===Meteor.userId();
    },

    roleOptions: function () {
        return Collections.Users.Roles;
    }
});

Template.viewUser.events({

    'click .cancel' :function(event) {
        Router.go('users');
        return false;
    }

});


Router.route('user/:_id', function () {
    let doc=UserCollection.findOne(this.params._id);
    if(doc==undefined) throw 'User '+this.params._id+' not found';
    let receivesNotifications=doc.profile===undefined ? false : doc.profile.receivesNotifications;
    let item={ password: '@@@@@@', receivesNotifications: receivesNotifications, role: doc.role};
    Session.set(CURRENT_USER_ID,this.params._id);
    this.render('viewUser',{data: { user: item }});
    },
    {
        name: 'render.user',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe("userAccounts")];
            });
        }
    }
);

AutoForm.hooks({
    viewUserForm: {
        after: {
            'method': function() {
                Router.go('users');
            }
        },
        before: {
            'method': function(doc) {
                console.log(doc);
                doc._id = Session.get(CURRENT_USER_ID);
                return doc;
            }
        },

    }
});