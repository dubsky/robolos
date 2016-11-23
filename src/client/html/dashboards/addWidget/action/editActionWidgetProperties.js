Template.editActionWidgetProperties.helpers({
    selectedIcon : function() {
        if(this.widget) return this.widget.icon;
    }
});
Template.editActionWidgetProperties.events({
    'click .updateProperties': function(event, instance) {

        $('#editWidgetProperties').modal('hide');
        let selection=Session.get('selectedAction');
        let dashboard=Session.get(CURRENT_DASHBOARD);
        let widgets=EditWidgetProperties.getWidgetsCollection(dashboard);

        if(this.create)
        {
            let id=(new Mongo.ObjectID()).toHexString();
            widgets.push({
                id : id,
                title: document.forms['editProperties'].elements['title'].value,
                icon: document.forms['editProperties'].elements['icon'].value,
                type: 'action',
                action: selection
            });
            EditWidgetProperties.preselectNewFloorPlanWidget(widgets[widgets.length-1].id);
        }
        else
        {
            let widget=EditWidgetProperties.getWidget(dashboard,this.widget.id);
            widget.icon=document.forms['editProperties'].elements['icon'].value;
            widget.title=document.forms['editProperties'].elements['title'].value;
        }

        EditWidgetProperties.updateDashboard(dashboard);
    },

    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }
});

Template.editActionWidgetProperties.onRendered(function() {
    if(!this.data.create) {
        document.forms['editProperties'].elements['title'].value = this.data.widget.title;
        document.forms['editProperties'].elements['icon'].value = this.data.widget.icon;
        Template.editActionWidgetProperties.handle=App.subscribeNoCaching('actions',{_id:this.data.widget.action},() => {
            let action=Collections.Actions.findOne(this.data.widget.action);
            let name='';
            if(action!==undefined) name=action.title;
            document.forms['editProperties'].elements['action'].value = name;
        });
    }
    SemanticUI.modal("#editWidgetProperties");
});

Template.editActionWidgetProperties.onDestroyed(function() {
    if(!this.data.create) {
        Template.editActionWidgetProperties.handle.stop();
        Template.editActionWidgetProperties.handle = undefined;
    }
});


