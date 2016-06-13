
Template.manageDemoConnection.helpers({
    schema: Schemas.DriverInstance,
    getMethod: function() {
        if(this.driverInstance._id===undefined) return 'createDriverInstance'; else return 'updateDriverInstance';
    }
});

Template.manageDemoConnection.events({
    'click .cancel' :function(event) {
        Router.go('driverInstances');
        return false;
    }
});


AutoForm.hooks({
    addDemoDriverInstanceForm: {
        after: {
            'method-update': function() {
                Router.go('driverInstances');
            }
        },
        before: {
            'method-update': function(doc) {
                doc.$set.driver = 'Demo Driver';
                return doc;
            }
        },
        onError: function(formType, error) {
            console.log(error);
        }
    }
});


Router.route('manageDemoConnection/create',
    function() {
        this.render('manageDemoConnection',{data: { driverInstance: {} }});
    },
    { name: 'manageDemoConnection/create'}
);


Router.route('manageDemoConnection/update/:_id',
    function () {
        var item = Collections.DriverInstances.findOne({_id: this.params._id });
        if(item==null) {
            this.render('notFound');
            return;
        }
        this.render('manageDemoConnection',{data: { driverInstance: item }});
    },
    {
        name: 'manageDemoConnection/update',
        waitOn: function() {
            return [App.subscribe('driverInstances')];
        }
    }
);

