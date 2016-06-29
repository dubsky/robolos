Template.floorPlanWidgetWrapper.helpers({
    widgetType : function(type) {
        return this.widget.type===type;
    },

    triggerMode : function() {
        var mode=Session.get(DASHBOARD_EDIT_MODE);
        if(!mode) {
            // this is due to a defect in jquery draggable - shows  handles when disabled
            $('div.ui-resizable-handle').hide();
            // disable drag on edit mode switch
            var id=this.widget.id;
            var selector=$('#'+id);
            selector.draggable( "option", "disabled", true );
        }
        return '';
    }
});

Template.floorPlanWidgetWrapper.onRendered(function() {
        var id=this.data.widget.id;
        var selector=$('#'+id);

        var disabled=true;//!Session.get(DASHBOARD_EDIT_MODE);
        selector.draggable({
            containment: "parent",
            disabled:disabled,
            stop: function( event, ui ) {
                let dashboard=Session.get(CURRENT_DASHBOARD);
                var floorPlanID=event.target.getAttribute('floorplan');
                var floorPlan=EditWidgetProperties.getWidget(dashboard,floorPlanID);
                var widget=EditWidgetProperties.getWidget(floorPlan,event.target.getAttribute('id'));
                if(widget.geometry===undefined) widget.geometry={};
                var geometry=EditWidgetProperties.getGeometry(dashboard,floorPlanID);
                widget.geometry.x=ui.position.left/geometry.size_x;
                widget.geometry.y=ui.position.top/geometry.size_y;
                Meteor.call('updateDashboard',{$set : {widgets: dashboard.widgets }},dashboard._id,function() {});
            },
            drag: function( event, ui ) { // avoid dashboard tile movements
                event.originalEvent.stopImmediatePropagation();
            },
            start: function( event, ui ) {
                event.originalEvent.stopImmediatePropagation();
            }
        });

        $(selector).resizable({
            disabled:disabled,
            //aspectRatio: true,
            autoHide: false,
            containment: "parent",
            //handles: "n, e, s, w",
            minHeight:32,
            mnWidth:32,
            maxHeight:128,
            maxWidth:128,
            handles: {
                'nw': '#nwgrip',
                'ne': '#negrip',
                'sw': '#swgrip',
                'se': '#segrip',
                'n': '#ngrip',
                'e': '#egrip',
                's': '#sgrip',
                'w': '#wgrip'
            },
            stop: function( event, ui ) {
                let dashboard=Session.get(CURRENT_DASHBOARD);
                var floorPlanID=event.target.getAttribute('floorplan');
                var floorPlan=EditWidgetProperties.getWidget(dashboard,floorPlanID);
                var widget=EditWidgetProperties.getWidget(floorPlan,event.target.getAttribute('id'));
                if(widget.geometry===undefined) widget.geometry={};
                var geometry=EditWidgetProperties.getGeometry(dashboard,floorPlanID);
                widget.geometry.width=ui.size.width/geometry.size_x;
                widget.geometry.height=ui.size.height/geometry.size_y;
                widget.geometry.x=ui.position.left/geometry.size_x;
                widget.geometry.y=ui.position.top/geometry.size_y;
                Meteor.call('updateDashboard',{$set : {widgets: dashboard.widgets }},dashboard._id,function() {});
            }
        });
        if(disabled) $('div.ui-resizable-handle').hide();
        $('#'+id+' .ui-resizable-handle').parent().parent().on('mousedown',function(e){ e.stopPropagation(); } );

});
