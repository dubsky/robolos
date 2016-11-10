Template.selectSubActionForAction.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedAction');
        return (typeof selection==='undefined') || selection===null;
    }
});

Template.selectSubActionForAction.events({

    'click .selectAction': function(event, instance) {
        var action=Session.get('selectedAction');
        var actionName=Session.get('selectedActionName');
        Blockly.FieldAction.activeBlock.setText(actionName);
        //console.log(EJSON.stringify({ id: action, name: actionName}));
        if((typeof actionName)==='undefined') actionName=action;
        Blockly.FieldAction.activeBlock.setValue(EJSON.stringify({ id: action, name: actionName}));
    }
});

Template.selectSubActionForAction.rendered=function() {
    Session.set('selectedAction',null);
    SemanticUI.modal('#selectActionBlock');

}