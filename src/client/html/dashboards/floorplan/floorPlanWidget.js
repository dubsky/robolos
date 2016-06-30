Template.floorPlanWidget.helpers({

    data: function () {
        return {
            widget: this.widget,
            geometry: this.geometry
        };
    } ,

    transformX: function(data,x) {
        return x*data.geometry.size_x;
    },

    transformY: function(data,w) {
        return w*data.geometry.size_y;
    },

    transformWidth: function(data,w) {
        var s=w*data.geometry.size_x;
        if(s<32) s=32;
        if(s>128) s=128;
        return s;
    },

    transformHeight: function(data,h) {
        var s=h*data.geometry.size_y;
        if(s<32) s=32;
        if(s>128) s=128;
        return s;
    },

    icon: function() {
        return Template.widgetIconSelector.getURLPathForImageID(this.widget.icon);
    },

    isEditMode : function() {
        var mode=Session.get(DASHBOARD_EDIT_MODE);
        return mode;
    },

    isSelected : function(id) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) return false;
        var selection=Template.floorPlanWidget.getSelection(Template.instance().data.widget.id);
        if(selection==undefined) return false;
        return selection[0]===id;
    }
});

Template.floorPlanWidget.ADD_TO='floorPlanWidget.ADD_TO';
Template.floorPlanWidget.SELECTION='floorPlanWidget.SELECTION_';

Template.floorPlanWidget.getSelection=function(floorPlanId) {
    return Session.get(Template.floorPlanWidget.SELECTION+floorPlanId);
}

Template.floorPlanWidget.setSelection=function(floorPlanId, selection) {
    Session.set(Template.floorPlanWidget.SELECTION+floorPlanId,selection);
}

Template.floorPlanWidget.events({
    "click .addFPWidget" : function () {
        Session.set(Template.addWidgetSelectWidgetType.FLOOR_PLAN_MODE,true);
        Session.set(Template.floorPlanWidget.ADD_TO,this.widget);
        Template.modal.current.set({template : 'addWidgetSelectWidgetType'});
    },

    "click .editFPWidget" : function () {
        let floorPlan=Template.instance().data.widget;
        let fpId=floorPlan.id;
        var currentSelection=Template.floorPlanWidget.getSelection(fpId);
        if(currentSelection!=undefined) {
            var widgetToEdit=EditWidgetProperties.getWidget(floorPlan,currentSelection[0]);
            Template.renderDashboard.editProperties(widgetToEdit);
        }
    },

    "click .fpWidget" : function (e) {
        if(Session.get(DASHBOARD_EDIT_MODE)) {
            let fpId=Template.instance().data.widget.id;
            var currentSelection=Template.floorPlanWidget.getSelection(fpId);
            if(currentSelection===undefined)
            {
                Template.floorPlanWidget.setSelection(fpId,[this.id]);
                Template.floorPlanWidgetControls.setControlsState(this.id,true);
            }
            else {
                if(currentSelection[0]===this.id) {
                    Template.floorPlanWidget.setSelection(fpId,undefined);
                    Template.floorPlanWidgetControls.setControlsState(this.id,false);
                }
                else {
                    Template.floorPlanWidget.setSelection(fpId,[this.id]);
                    Template.floorPlanWidgetControls.setControlsState(currentSelection,false);
                    Template.floorPlanWidgetControls.setControlsState(this.id,true);
                }
            }
        }
    },

    "click .removeFPWidget" : function () {
        let selection=Template.floorPlanWidget.getSelection(this.widget.id);
        let dashboard=Session.get(CURRENT_DASHBOARD);
        var floorPlan=EditWidgetProperties.getWidget(dashboard,this.widget.id);
        if (selection!==undefined)
        {
            for(let i=0;i<selection.length;i++) {
                EditWidgetProperties.removeWidget(floorPlan,selection[i]);
            }
            EditWidgetProperties.updateDashboard(dashboard);
        }
    }

});
