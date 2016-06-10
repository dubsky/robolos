Template.sensorWidgetFooter.helpers({

    lastUpdate : function() {
        if((typeof this.data)=='undefined') return 'Loading...';
        var stamp=this.data.timestamp;
        return DateUtils.getDateString(stamp);
    }
});