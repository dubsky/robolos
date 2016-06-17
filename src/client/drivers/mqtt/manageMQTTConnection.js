
Template.manageMQTTConnection.helpers({
    schema: Schemas.DriverInstance,
    getMethod: function() {
        if(this.driverInstance._id===undefined) return 'createDriverInstance'; else return 'updateDriverInstance';
    }
});

Template.manageMQTTConnection.events({
    'click .cancel' :function(event) {
        Router.go('driverInstances');
        return false;
    }
});


AutoForm.hooks({
    addMQTTDriverInstanceForm: {
        after: {
            'method-update': function() {
                Router.go('driverInstances');
            }
        },
        before: {
            'method-update': function(doc) {
                doc.$set.driver = 'MQTT Driver';
                return doc;
            }
        },
        onError: function(formType, error) {
            console.log(error);
        }
    }
});


Router.route('manageMQTTConnection/create',
    function() {
        this.render('manageMQTTConnection',{data: { driverInstance: {} }});
    },
    { name: 'manageMQTTConnection/create'}
);


Router.route('manageMQTTConnection/update/:_id',
    function () {
        var item = Collections.DriverInstances.findOne({_id: this.params._id });
        if(item==null) {
            this.render('notFound');
            return;
        }
        this.render('manageMQTTConnection',{data: { driverInstance: item }});
    },
    {
        name: 'manageMQTTConnection/update',
        waitOn: function() {
            return [App.subscribe('driverInstances')];
        }
    }
);

