Template.selectVariableForAction.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedVariable');
        return (typeof selection==='undefined') || selection===null;
    }
});

Template.selectVariableForAction.events({

    'click .selectVariable': function(event, instance) {

        var variable=Session.get('selectedVariable');
        var variableName=Session.get('selectedVariableName');
        Blockly.FieldControlVariable.activeBlock.setText(variableName);
        //console.log(EJSON.stringify({ id: variable, name: variableName}));
        if((typeof variableName)==='undefined') variableName=variable;
        Blockly.FieldControlVariable.activeBlock.setValue(EJSON.stringify({ id: variable, name: variableName}));
    }
});

Template.selectVariableForAction.rendered=function() {
    Session.set('selectedVariable',null);
}