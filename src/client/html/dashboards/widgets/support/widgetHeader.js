Template.widgetHeader.helpers({

    isInEditMode : function() {
        return (true===Session.get(DASHBOARD_EDIT_MODE));
    },

    title: function() {
        return this.widget.title;
    },

    toolbarIconWidth: function() {
        var icons=0;
        if (Session.get(DASHBOARD_EDIT_MODE)) icons+=2;
        if(this.sensorData) icons+=1;
        return 17*icons+4*(icons-1)+4;
    }
});

Template.widgetHeader.events({
    'click .openGraph' : function(e) {
        Template.modal.current.set({template : 'renderTimeSeries', data : {sensor: this.sensorData._id}});
    }
});