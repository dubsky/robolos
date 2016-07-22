
Template.actionSelectorModal.helpers({

    emptySelection : function() {
        var selection=Session.get('selectedAction');
        return (typeof selection==='undefined') || selection===null;
    }

});


Template.actionSelectorModal.events({
    'click .selectAction': function(event, instance) {
        let fieldName=Session.get('selectedAction');
        if(this.onSelection!==undefined) this.onSelection(fieldName);
        Session.set(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+this.name,{ title: Session.get('selectedActionName'), id: fieldName });
        return false;
    }
});

Template.actionSelectorModal.onRendered(function() {
    SemanticUI.modal("#selectAction");
});
