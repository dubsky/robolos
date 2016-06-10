Template.editFloorPlanWidgetProperties.helpers({
    selectedIcon : function() {
        if(this.widget) return this.widget.icon;
    }
});
Template.editFloorPlanWidgetProperties.events({

    'click .updateProperties': function(event, instance) {
        $('#editWidgetProperties').modal('hide');
        let dashboard=Session.get(CURRENT_DASHBOARD);
        let widgets=EditWidgetProperties.getWidgetsCollection(dashboard);

        for(var i in widgets) {
            if(widgets[i].id===this.widget.id)
            {
                widgets[i].title=document.forms['editProperties'].elements['title'].value;
                widgets[i].icon=document.forms['editProperties'].elements['icon'].value;
            }
        }

        EditWidgetProperties.updateDashboard(dashboard);
    },

    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    }
});

Template.editFloorPlanWidgetProperties.onRendered(function() {
    document.forms['editProperties'].elements['title'].value = this.data.widget.title;
    document.forms['editProperties'].elements['icon'].value = this.data.widget.icon;
    SemanticUI.modal("#editWidgetProperties");
});