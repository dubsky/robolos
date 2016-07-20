Template.emailField.helpers({

    name: function() {
        if(this.emails!=undefined && this.emails.length>0)
        {
            return _.pluck(this.emails,'address').join(',');
        }
        return '';
    }

});