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
            console.log('There is user:',user);
            self.added("userAccounts", user._id, user);
        }
    );

    self.ready();
});


Meteor.methods({
    deleteUsers : function(list) {
    }
});