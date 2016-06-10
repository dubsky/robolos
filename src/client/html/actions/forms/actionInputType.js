
Template.actionInputType.helpers({

    valueHolder : function() {

        if((typeof this.atts)!=='undefined')
            return this.atts['data-schema-key'];
    },

    selectedActionName: function() {
        var actionInfo=Session.get(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+this.name);
        if(actionInfo!=null) return actionInfo.title; else return '';
    },

    selectedActionUsageId: function() {
        return this.name;
    },

    emptySelection : function() {
        var selection=Session.get('selectedAction');
        return (typeof selection==='undefined') || selection===null;
    },

    icon: function() {
        if((typeof this.atts.icon)!=='undefined') return this.atts.icon; else return "fa-play";
    }

});

Template.actionInputType.clearSession=function () {
    delete Session.keys[Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+this.data.name];
};

Template.actionInputType.onCreated(Template.actionInputType.clearSession);
Template.actionInputType.onDestroyed(Template.actionInputType.clearSession);

Template.actionInputType.storeCurrentFormChanges=function(editContext) {
    var collection=new Mongo.Collection(null);
    var document=editContext.getDocument();
    if(editContext.modifier!==undefined) collection._collection._modifyAndNotify(document,editContext.modifier);
};

Template.actionInputType.routeBack=function(editContext, route) {
    console.log('routing back !');
    Router.go(route.routeName,{document:editContext.getDocument(),_id:editContext.getDocument()._id});
};

Template.actionInputType.configureRoute=function(targetRouteName,params,actionFieldName) {
    var editContext=EditContext.getContext();
    editContext.setFieldName(actionFieldName);
    Template.actionInputType.storeCurrentFormChanges(editContext);

    editContext.getReturnRoute().onSave=function() {
        console.log('onSave !',this);
        Template.actionInputType.routeBack(editContext,this);
    };
    editContext.getReturnRoute().onCancel=function() {
        console.log('onCancel !',this);
        Template.actionInputType.routeBack(editContext,this);
    };

    editContext.keepEditContextOnNextRoute();
    console.log('context :',editContext);
    console.log('go to :',targetRouteName);
    Router.go(targetRouteName,params);
};

Template.actionInputType.events({
    'click .actionSelector': function(event, instance) {
        let fieldName=this.name;
        var editContext=EditContext.getContext();
        editContext.setFieldName(fieldName);
        var self=this;
        let showActionSelectionModal=function() {
            Template.modal.current.set( {template : 'actionSelectorModal', data : { name: self.name} });
        };

        Template.actionInputType.storeCurrentFormChanges(editContext);

        editContext.getReturnRoute().onCancel=function() {
            Template.actionInputType.routeBack(editContext,this);
            showActionSelectionModal();
        };

        editContext.getReturnRoute().onSave=function() {
            Template.actionInputType.routeBack(editContext,this);
        };

        showActionSelectionModal();
        return false;
    },

    'click .actionEditor': function(event, instance) {
        EditContext.getContext().keepContextOnNextModalClose();
        $('#sensorMetaEditor').modal('hide');
        Template.actionInputType.configureRoute('render.action',{_id: Session.get(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+this.name).id},this.name);
    },

    'click .createAction': function(event, instance) {
        EditContext.getContext().keepContextOnNextModalClose();
        $('#sensorMetaEditor').modal('hide');
        Template.actionInputType.configureRoute('addAction',undefined,this.name);
    }

});

Template.actionInputType.SESSION_PREFIX_SELECT_ACTION='SELECT_ACTION_';

AutoForm.addInputType('action',{

    template: 'actionInputType',
    valueIn:function(value,typeFieldInfo) {
        if (Session.get(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+typeFieldInfo.name)===undefined)
        {
            if(value!==null && (typeof value)!=='undefined' && value!=='') {
                var action=Collections.Actions.findOne({_id : value});
                if((typeof action)!=='undefined')
                    Session.set(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+typeFieldInfo.name,{ title: action.title, id:action._id});
                else
                    Session.set(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+typeFieldInfo.name,null);
            }
            else
            {
                Session.set(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+typeFieldInfo.name,null);
            }
        }
    },

    valueOut:function() {
        try {
            var usageId=this.context.getAttribute('selectedActionUsageId');
            var actionInfo=Session.get(Template.actionInputType.SESSION_PREFIX_SELECT_ACTION+usageId);
            if(actionInfo!=null) {
                return actionInfo.id;
            } else {
                return '';
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }
});
