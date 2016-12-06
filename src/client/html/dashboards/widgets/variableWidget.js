Template.variableWidget.helpers({

    data: function (x) {
        var id=this.widget.variable;
        var variableData=SensorStatusCollection.findOne(id);
        return {
            variable:variableData,
            widget:this,
            icon: Template.widgetIconSelector.getURLPathForImageID(this.widget.icon)
         };
    },

    variableType: function(type,x) {
        if(this.variable===undefined) return false;
        return type===this.variable.type;
    },

    mode:function() {
        if(this.variable===undefined) return 'N/A';
        if(this.variable.modifiedBy==='user') return 'Manual Only';
        if(this.variable.modifiedBy==='action') return 'Auto Only';
        if(this.variable.allowAutomaticControl) return 'Auto'; else return 'Manual';
    }
});

Template.variableWidget.events({
    'click .modeButton' : function() {
        //ConnectionManager.call('startAction',this.widget.widget.action);
    }
});



