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
            for(var i in widgets) {
                if(widgets[i].id===this.widget.id)
                {
                    widgets[i].title=document.forms['editProperties'].elements['title'].value;
                    widgets[i].icon=document.forms['editProperties'].elements['icon'].value;
                }
            }
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
        var variable=Collections.Variables.findOne(this.data.widget.variable);
        var name='';
        if(variable!==undefined) name=variable.title;
        document.forms['editProperties'].elements['variable'].value = name;
    }
    SemanticUI.modal("#editVariableWidgetProperties");
});