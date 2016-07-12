Meteor.publish('userAccounts', function(filter,reactive) {
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    var cursor;
    if (filter == undefined) {
        cursor = Meteor.users.find();
    }
    else {
        cursor = Meteor.users.find(filter);
    }

    cursor.forEach(
        function (user) {
            if(user._id!=self.userId)
                self.added("userAccounts", user._id, user);
        }
    );

    self.ready();
});


Meteor.methods({
    addUser : function(modifier) {
        console.log('add user',modifier);
    },

    deleteUsers : function(list) {
    }
});