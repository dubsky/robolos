Template.floorPlanWidgetControls.onDestroyed(function() {
//    var selector='#'+this.data.widget.id;
//    $(selector).draggable( "option", "disabled", true );
//    $(selector).resizable( "option", "disabled", true );
});

Template.floorPlanWidgetControls.onRendered(function() {
    if (Session.get(DASHBOARD_EDIT_MODE))
    {
        var id=this.data.widget.id;
        var selector=$('#'+id);
        selector.draggable( "option", "disabled", false );
        selector.resizable( "option", "disabled", false );
        // this is due to a defect in jquery draggable - shows  handles when disabled
        $('div.ui-resizable-handle').show();
    }
});
