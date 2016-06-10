Template.stringDashboardVariable.idGenerator=0;

Template.stringDashboardVariable.events({
    'click .popupEditor' : function(e) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            var target = $(e.currentTarget);
            if (this.variable.modifiedBy !== 'action') {
                var template = Blaze.toHTMLWithData(Template.stringDashboardVariableEditor, {
                        autoControl: this.variable.modifiedBy === 'both',
                        data: this,
                        id: Template.stringDashboardVariable.idGenerator++
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
                $('.stringVariableValueSelection').dropdown();
            }
        }
    }
});