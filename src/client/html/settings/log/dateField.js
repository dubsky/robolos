Template.dateField.helpers({
    value : function() {
        //return DateUtils.getDateString(this.time);
        return this.time.toLocaleString();
    }
});