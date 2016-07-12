Template.userNameField.helpers({

    name: function() {
        if(this.username!==undefined) return this.username;
        if(this.emails!=undefined && this.emails.length>0)
            return this.emails[0].address;
        return this._id;
    }

});