Template.numberDashboardVariable.idGenerator=0;

Template.numberDashboardVariable.events({
    'click .popupEditor' : function(e) {
        if (Session.get(DASHBOARD_EDIT_MODE)!==undefined && !Session.get(DASHBOARD_EDIT_MODE)) {
            var target = $(e.currentTarget);
            if (this.variable.modifiedBy !== 'action') {
                var template = Blaze.toHTMLWithData(Template.numberDashboardVariableEditor, {
                        autoControl: this.variable.modifiedBy === 'both',
                        data: this,
                        id: Template.numberDashboardVariable.idGenerator++
                    }
                );
                $(target).popup({
                    position: 'right center',
                    hoverable: true,
                    on: 'click',
                    variation: 'very wide',
                    html: template,
                    delay: {
                        show: 300,
                        hide: 800
                    }
                });
                $(target).popup('show');
            }
        }
    }
});
