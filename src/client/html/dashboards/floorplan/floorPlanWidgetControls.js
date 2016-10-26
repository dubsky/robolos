Template.floorPlanWidgetControls.onDestroyed(function() {
//    var selector='#'+this.data.widget.id;
//    $(selector).draggable( "option", "disabled", true );
//    $(selector).resizable( "option", "disabled", true );
});

Template.floorPlanWidgetControls.setControlsState=function(widgetId,enabled) {
    if (Session.get(DASHBOARD_EDIT_MODE))
    {
        var selector=$('#'+widgetId);
        selector.draggable( "option", "disabled", !enabled );
        selector.resizable( "option", "disabled", !enabled );
        // this is due to a defect in jquery draggable - shows  handles when disabled
        if(enabled) $('#'+widgetId+'> div.ui-resizable-handle').show(); else $('#'+widgetId+'> div.ui-resizable-handle').hide();
    }
};

Template.floorPlanWidgetControls.onRendered(function() {
    if (Session.get(DASHBOARD_EDIT_MODE))
    {
        let selection=Template.floorPlanWidget.getSelection(this.data.floorPlan.id);
        if(selection!==undefined)
            for(let s of selection)
            {
                if(s===this.data.widget.id)
                {
                    Template.floorPlanWidgetControls.setControlsState(s,true);
                }
            }
    }
});


