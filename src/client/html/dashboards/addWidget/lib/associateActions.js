Template.associateActions.helpers({
    actions:function() {
        let result=[];
        let widget=Template.associateActions.widget.get();
        for(let i in widget.actions) {
            let action=Collections.Actions.findOne(widget.actions[i]);
            if(action!=null) {
                result[result.length]={id:action._id,name:action.title};
            }
        }
        return result;
    }
});

Template.associateActions.events({

    'click .delete' : function() {
        let widget=Template.associateActions.widget.get();
        for(let i in widget.actions) {
            if (widget.actions[i]===this.id) {
                widget.actions.splice(i,1);
                break;
            }
        }
        Template.associateActions.widget.set(widget);
    },

    'click .addAction' : function() {
        let self=this;
        Template.modal.current.set( {template : 'actionSelectorModal',
            data: {disableCreateAction:true,
                onSelection: function(action) {
                    let widget=Template.associateActions.widget.get();
                    if(widget.actions===undefined) widget.actions=[];
                    widget.actions[widget.actions.length]=action;
                    Template.associateActions.widget.set(widget);
                    self.widget.actions=widget.actions;
                }
            }});
    }
});

Template.associateActions.onCreated(function() {
    Template.associateActions.widget=new ReactiveVar(this.data.widget!==undefined ? this.data.widget: []);
});

Template.associateActions.onDestroyed(function() {
    delete Template.associateActions.widget;
});

