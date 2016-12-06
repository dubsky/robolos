Template.manageMySensorsConnection.helpers({
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
            defaultValue: 'My Sensors'
        },
        'properties.gwType': {
            label: "Gateway Type",
            defaultValue: 'serial',
            allowedValues:['serial','ethernet'],
            type: String
        },
        'properties.serial': {
            label: "Serial Properties",
            type: Object,
            optional: true
        },
        'properties.serial.gwSerialPort': {
            label: "Serial Port",
            type: String
        },
        'properties.serial.gwBaud': {
            label: "Connection Speed",
            defaultValue: 115200,
            type: Number
        },
        'properties.ethernet': {
            label: "Ethernet Properties",
            type: Object,
            optional: true
        },
        'properties.ethernet.gwAddress': {
            label: "Address",
            defaultValue: '127.0.0.1',
            type: String
        },
        'properties.ethernet.gwPort': {
            label: "Port",
            defaultValue: '5003',
            type: Number
        }
    }),
    getMethod: function() {
        if(this.driverInstance._id===undefined) return 'createDriverInstance'; else return 'updateDriverInstance';
    },
    typeOptions: [{label: "Serial", value: 'serial'},
        {label: "Ethernet", value: 'ethernet'}],

    isSerial: function() {
        var f=AutoForm.getFieldValue('properties.gwType');
        return f===undefined || f==='serial';
    },

    baudRateOptions: function () {
        return [300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200].map(function (c) {
            return {label: c+'Bd' , value: c};
        });
    },

    serialPortOptions: function() {
        return Template.instance().ports.get();
    }
});

Template.manageMySensorsConnection.loadPorts=function(template) {
    ConnectionManager.call('mysensors-listSerialPorts',function(err,f) {
        if(err) console.log('Error listing serial ports',err);
        template.ports.set(f);
    });
}

Template.manageMySensorsConnection.events({
    'click .cancel' : function(event) {
        Router.go('driverInstances');
        return false;
    },
    'click .refresh' : function(event) {
        Template.manageMySensorsConnection.loadPorts(Template.instance());
    }

});


Template.manageMySensorsConnection.onCreated(function(){
    let template=Template.instance();
    template.ports=new ReactiveVar([]);
    Template.manageMySensorsConnection.loadPorts(template);
});


AutoForm.hooks({
    addMySensorsDriverInstanceForm: {
        after: {
            'method-update': function() {
                Router.go('driverInstances');
            }
        },
        before: {
            'method-update': function(doc) {
                doc.$set.driver = 'My Sensors';
                return doc;
            }
        },
        onError: function(formType, error) {
            console.log(error);
        }
    }
});


Router.route('manageMySensorsConnection/create',
    function() {
        this.render('manageMySensorsConnection',{data: { driverInstance: {} }});
    },
    { name: 'manageMySensorsConnection/create'}
);


Router.route('manageMySensorsConnection/update/:_id',
    function () {
        var item = Collections.DriverInstances.findOne({_id: this.params._id });
        if(item==null) {
            this.render('notFound');
            return;
        }
        this.render('manageMySensorsConnection',{data: { driverInstance: item }});
    },
    {
        name: 'manageMySensorsConnection/update',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe('driverInstances')];
            });
        }
    }
);