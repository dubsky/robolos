Template.sensorMetaEditor.SENSOR_DOCUMENT='sensorMetaEditor.SENSOR_DOCUMENT';

Template.sensorMetaEditor.onCreated(function() {
    var doc;
    var context=EditContext.getContext();
    if(context===undefined) {
        // take just the id and class from the input sensor
        var sensorId = this.data.sensor._id;
        var sensorClass=this.data.sensor.class;
        // happens when routed from 'sensors' directly
        doc = Collections.SensorsMetadata.findOne({_id: sensorId},{reactive: false});
        if (doc == null) {
            doc={};
            Schemas.SensorsMetadata.clean(doc);
            doc._id=sensorId;
            doc.name=this.data.sensor.name;
            doc.keywords=this.data.sensor.keywords;
        }
        else {
            //fill in the class - it is need to decide how the form will look like
            if(doc.name===undefined) doc.name=this.data.sensor.name;
            //fill in driver provided data if not overridden by the user
            if(doc.keywords===undefined) doc.keywords=this.data.sensor.keywords;
        }
        doc.class = sensorClass;
        var context=new EditContext('Edit Sensor',{routeName: 'sensors'},doc);
        EditContext.setContext(context);
    }
    else {
        doc=context.getDocument();
    }
    Session.set(Template.sensorMetaEditor.SENSOR_DOCUMENT, doc);
});

Template.sensorMetaEditor.onRendered(function() {
    SemanticUI.modal2ndLayer("#sensorMetaEditor",function() {},function() {
        EditContext.modalClosed();
    });
});

Template.sensorMetaEditor.onDestroyed(function() {
    Session.set(Template.sensorMetaEditor.SENSOR_DOCUMENT,undefined);
});

Template.sensorMetaEditor.helpers({

    document: function () {
        let d=Session.get(Template.sensorMetaEditor.SENSOR_DOCUMENT);
        console.log(d);
        return d;
    },

    isBinaryInput : function () {
        var sensor=Session.get(Template.sensorMetaEditor.SENSOR_DOCUMENT);
        if((typeof sensor)==='undefined') return false;
        return sensor.class===SensorClasses.BINARY_INPUT;
    },

    isBinary : function () {
        var sensor=Session.get(Template.sensorMetaEditor.SENSOR_DOCUMENT);
        if((typeof sensor)==='undefined') return false;
        return sensor.class===SensorClasses.BINARY_INPUT || sensor.class===SensorClasses.BINARY_OUTPUT;
    },

    isAnalogInput : function () {
        var sensor=Session.get(Template.sensorMetaEditor.SENSOR_DOCUMENT);
        if((typeof sensor)==='undefined') return false;
        return sensor.class===SensorClasses.ANALOG_INPUT || sensor.class===SensorClasses.ANALOG_INPUT_0_100;
    },

    collection: function() {
        return Collections.SensorsMetadata
    },

    schema: function() {
        return Schemas.SensorsMetadata;
    }
});

Template.sensorMetaEditor.events({
    'click .saveMeta': function() {
        $(sensorMetaForm).submit();
    },

    'click .cancel': function() {
        EditContext.setContext(undefined);
    }
});

AutoForm.hooks({
    sensorMetaForm: {
        after: {
            'method-update': function() {
                $('#sensorMetaEditor').modal('hide');
            }
        },
        formToModifier: function(modifier) {
            EditContext.getContext().modifier=modifier;
            return modifier;
        }
    }
});