Template.booleanDashboardVariable.idGenerator=0;

Template.booleanDashboardVariable.events({

    'click .popupEditor' : function(e) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            if (this.variable.modifiedBy === 'user') {
                var v = this.variable.booleanValue;
                if (v === undefined) v = false;
                Meteor.call('setBooleanVariable', this.variable._id, !v);
            }
            else if (this.variable.modifiedBy === 'both') {
                var target = $(e.currentTarget)
                var template = Blaze.toHTMLWithData(Template.booleanDashboardVariableEditor, {
                        autoControl: true,
                        data: this,
                        id: Template.booleanDashboardVariable.idGenerator++
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
