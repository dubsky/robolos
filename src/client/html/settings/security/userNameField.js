Template.userNameField.helpers({

    name: function() {
        return UserCollection.getUserName(this);
    }

});