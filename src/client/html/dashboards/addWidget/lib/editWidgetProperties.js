EditWidgetProperties={

    getWidget: function(dashboard,id) {
        for(var i in dashboard.widgets) {
            let widget=dashboard.widgets[i];
            if(widget.id===id)
            {
                return widget;
            }
            if(widget.widgets!=undefined) {
                let subWidget=this.getWidget(widget,id);
                if(subWidget!=undefined) return subWidget;
            }
        }
        return undefined;
    },

    getGeometry: function(dashboard,id) {
        for(var i in dashboard.geometry) {
            if(dashboard.geometry[i].id===id)
            {
                return dashboard.geometry[i];
            }
        }
        return undefined;
    },

    removeWidget: function(dashboard,id) {
        for(var i in dashboard.widgets) {
            if(dashboard.widgets[i].id===id)
            {
                dashboard.widgets.splice(i,1);
                return;
            }
        }
        console.log('not found ! '+dashboard+' '+id);
    },

    getWidgetsCollection: function(dashboard) {
        //abstract from dashboard vs. floorplan
        var floorPlanMode=Session.get(Template.addWidgetSelectWidgetType.FLOOR_PLAN_MODE);
        var widgets;
        if(floorPlanMode) {
            var floorPlan=this.getWidget(dashboard,Session.get(Template.floorPlanWidget.ADD_TO).id);
            widgets=floorPlan.widgets;
            if(widgets===undefined) {
                widgets=[];
                floorPlan.widgets=widgets;
            }
            return widgets;
        }
        else {
            widgets=dashboard.widgets;
            if(widgets===undefined) dashboard.widgets=widgets=[];
            return widgets;
        }
    },

    updateDashboard: function(dashboard) {
        //console.log('update dashboard',dashboard);
        //console.log(Template.renderDashboardRedirect.subscriptionHandle);
        //Template.renderDashboardRedirect.subscriptionHandle.stop();
        ConnectionManager.call('updateDashboard',{$set : { widgets : dashboard.widgets}},dashboard._id,function() {
            Router.go('render.dashboard',{_id: dashboard._id});
        });
        Session.set(Template.floorPlanWidget.ADD_TO,undefined);
    },

    preselectNewFloorPlanWidget: function(widgetId) {
        if(Session.get(Template.addWidgetSelectWidgetType.FLOOR_PLAN_MODE)) {
            Template.floorPlanWidget.selectWidget(Session.get(Template.floorPlanWidget.ADD_TO).id,widgetId);
        }
    }



};