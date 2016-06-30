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
            widgets.push({
                id : (new Mongo.ObjectID()).toHexString(),
                title: document.forms['editProperties'].elements['title'].value,
                icon: document.forms['editProperties'].elements['icon'].value,
                type: 'action',
                action: selection
            });
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
        var action=Collections.Actions.findOne(this.data.widget.action);
        var name='';
        if(action!==undefined) name=action.title;
        document.forms['editProperties'].elements['action'].value = name;
    }
    SemanticUI.modal("#editWidgetProperties");
});