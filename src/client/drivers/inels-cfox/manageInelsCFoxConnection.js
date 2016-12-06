
Template.manageInelsCFoxConnection.helpers({

    schema: new SimpleSchema({
        title: {
            type: String,
            label: "Name",
            max: 64
        },
        description: {
            type: String,
            label: "Description",
            optional: true
        },
        driver: {
            type: String,
            defaultValue: 'INELS2/CFox',
        },
        'properties.address': {
            label: "Central Unit Address",
            defaultValue: '192.168.0.1',
            type: String
        },
        'properties.port': {
            label: "Central Unit Port",
            defaultValue: '61682',
            min:0,
            max:65535,
            type: Number
        }
    }),

    getMethod: function() {
        if(this.driverInstance._id===undefined) return 'createDriverInstance'; else return 'updateDriverInstance';
    },

    expFormData: { type : 'cfoxExpFile'},
    pubFormData: { type : 'cfoxPubFile'},
    pubCallbacks: {
        formData: function() {  },
        finished: function(index, fileInfo, context) {
            var s=Template.manageInelsCFoxConnection.validation.get();
            s.pubUploaded=true;
            Template.manageInelsCFoxConnection.validation.set(s);
        }
    },
    expCallbacks: {
        formData: function() {  },
        finished: function(index, fileInfo, context) {
            var s=Template.manageInelsCFoxConnection.validation.get();
            s.expUploaded=true;
            Template.manageInelsCFoxConnection.validation.set(s);
        }
    },
    uploadError: function() {
        var s=Template.manageInelsCFoxConnection.validation.get();
        return s.showError && !s.pubUploaded;
    }
});

Template.manageInelsCFoxConnection.onCreated(function(){
    let isEdit=this.data.driverInstance!==undefined;
    Template.manageInelsCFoxConnection.validation=new ReactiveVar({
        showError : false,
        expUploaded : isEdit,
        pubUploaded : isEdit
    });
});


Template.manageInelsCFoxConnection.events({
    'click .cancel' :function(event) {
        Router.go('driverInstances');
        return false;
    }
});

SimpleSchema.messages({
    'missingUpload': 'Please upload the required files'
});

AutoForm.hooks({
    addCFoxDriverInstanceForm: {
        after: {
            'method-update': function() {
                Router.go('driverInstances');
            }
        },
        before: {
            'method-update': function(doc) {
                doc.$set.driver = 'INELS2/CFox';
                var s=Template.manageInelsCFoxConnection.validation.get();
                if(!s.pubUploaded) {
                    s.showError=true;
                    Template.manageInelsCFoxConnection.validation.set(s);
                    return false
                }
                return doc;
            }
        },

        onError: function(formType, error) {
            console.log(error);
        }
    }
});


Router.route('manageInelsCFoxConnection/create',
    function() {
        this.render('manageInelsCFoxConnection',{data: { driverInstance: {} }});
    },
    { name: 'manageInelsCFoxConnection/create'}
);


Router.route('manageInelsCFoxConnection/update/:_id',
    function () {
        var item = Collections.DriverInstances.findOne({_id: this.params._id });
        if(item==null) {
            this.render('notFound');
            return;
        }
        this.render('manageInelsCFoxConnection',{data: { driverInstance: item }});
    },
    {
        name: 'manageInelsCFoxConnection/update',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe('driverInstances')];
            });
        }
    }
);