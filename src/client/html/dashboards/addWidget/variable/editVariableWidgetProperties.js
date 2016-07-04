Template.editVariableWidgetProperties.helpers({
    selectedIcon : function() {
        if(this.widget) return this.widget.icon;
    }
});

Template.editVariableWidgetProperties.events({

    'click .updateProperties': function(event, instance) {
        $('#editVariableWidgetProperties').modal('hide');
        let selection=Session.get('selectedVariable');
        let dashboard=Session.get(CURRENT_DASHBOARD);
        let widgets=EditWidgetProperties.getWidgetsCollection(dashboard);

        if(this.create)
        {
            widgets.push({
                id : (new Mongo.ObjectID()).toHexString(),
                title: document.forms['editProperties'].elements['title'].value,
                icon: document.forms['editProperties'].elements['icon'].value,
                type: 'variable',
                variable: selection
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

    'click .cancel1': function(event, instance) {
        $('#editVariableWidgetProperties').modal('hide');
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }
});

Template.editVariableWidgetProperties.onRendered(function() {
    if(!this.data.create) {
        document.forms['editProperties'].elements['title'].value = this.data.widget.title;
        document.forms['editProperties'].elements['icon'].value = this.data.widget.icon;

        Template.editVariableWidgetProperties.handle=Meteor.subscribe('variables',{_id:this.data.widget.variable},() => {
            let variable=Collections.Variables.findOne(this.data.widget.variable);
            let name='';
            if(variable!==undefined) name=variable.title;
            document.forms['editProperties'].elements['variable'].value = name;
        });
    }
    SemanticUI.modal("#editVariableWidgetProperties");
});

Template.editVariableWidgetProperties.onDestroyed(function() {
    if(!this.data.create) {
        Template.editVariableWidgetProperties.handle.stop();
        Template.editVariableWidgetProperties.handle = undefined;
    }
});