Template.tableTextSearch.SESSION_PREFIX='search.filter.';

Template.tableTextSearch.onCreated(function () {
    ReactiveTable.clearFilters('table-text-search');
    this.filter = new ReactiveTable.Filter('table-text-search', []);
    if(this.data!==null && this.data.filterKey!==undefined) {
        let filter=Session.get(Template.tableTextSearch.SESSION_PREFIX+this.data.filterKey);
        if(filter===null) {
            filter='';
        }
        this.filter.set(filter);
    } else {
        this.filter.set('')
    }
});

Template.tableTextSearch.helpers({
    value: function() {
        let val=Session.get(Template.tableTextSearch.SESSION_PREFIX+this.filterKey);
        return val;
    }

});

Template.tableTextSearch.events({
    "keyup .table-text-search, input .table-text-search": function (event, template) {
        let value=$(event.target).val();
        template.filter.set({  $regex: value});
        if(this.filterKey!==undefined) Session.set(Template.tableTextSearch.SESSION_PREFIX+this.filterKey,value);

    }
});