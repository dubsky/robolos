
Template.manageHueEmulatorConnection.helpers({
    schema: Schemas.DriverInstance,
    getMethod: function() {
        if(this.driverInstance._id===undefined) return 'createDriverInstance'; else return 'updateDriverInstance';
    }
});

Template.manageHueEmulatorConnection.events({
    'click .cancel' :function(event) {
        Router.go('driverInstances');
        return false;
    }
});


AutoForm.hooks({
    addHueEmulatorDriverInstanceForm: {
        after: {
            'method-update': function() {
                Router.go('driverInstances');
            }
        },
        before: {
            'method-update': function(doc) {
                doc.$set.driver = 'Philips HUE Emulator';
                return doc;
            }
        },
        onError: function(formType, error) {
            console.log(error);
        }
    }
});


Router.route('manageHueEmulatorConnection/create',
    function() {
        this.render('manageHueEmulatorConnection',{data: { driverInstance: {} }});
    },
    { name: 'manageHueEmulatorConnection/create'}
);


Router.route('manageHueEmulatorConnection/update/:_id',
    function () {
        var item = Collections.DriverInstances.findOne({_id: this.params._id });
        if(item==null) {
            this.render('notFound');
            return;
        }
        this.render('manageHueEmulatorConnection',{data: { driverInstance: item }});
    },
    {
        name: 'manageHueEmulatorConnection/update',
        waitOn: function() {
            return [App.subscribe('driverInstances')];
        }
    }
);

