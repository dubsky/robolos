Template.severityField.helpers({
    value : function() {
        return '<span class='+this.level+'MessageLevel>'+this.level.toUpperCase()+'</span>';
    }
});