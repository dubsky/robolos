Template.dateDashboardVariable.helpers({
    isOutOfDate : function() {
        return this.variable.dateValue < new Date();
    }
});

Template.dateDashboardVariable.idGenerator=0;

Template.dateDashboardVariable.events({
    'click .popupEditor' : function(e) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            var target=$(e.currentTarget)
            if(this.variable.modifiedBy!=='action')
            {
                var template=Blaze.toHTMLWithData(Template.dateDashboardVariableEditor,{
                    autoControl: this.variable.modifiedBy==='both',
                    data: this,
                    startDate: moment(this.variable.dateValue).format('MM/DD/YYYY h:mm A'),
                    id: Template.dateDashboardVariable.idGenerator++}
                );
                $(target).popup({
                    position : 'right center',
                    hoverable: true,
                    on:'manual',
                    variation: 'very wide',
                    html  : template,
                    closable:false/*,
                    delay: {
                        show: 300,
                        hide: 800000
                    }*/
                });
                $(target).popup('show');
                $('.dateVariableEditor').daterangepicker({
                        singleDatePicker: true,
                        //showDropdowns: true,
                        timePicker: true,
                        locale: {
                            format: 'MM/DD/YYYY h:mm A'
                        },
                        ranges: {
                            'Next 15 minutes': [moment().add(15, 'minutes'), moment()],
                            'Next Hour': [moment().add(1, 'hours'), moment()],
                            'Next 8 Hours': [moment().add(8, 'hours'), moment()],
                            'Tommorrow': [moment().add(1, 'days'), moment()],
                            'Next 7 days': [moment().add(7, 'days'), moment()],
                            'Next 30 days': [moment().add(30, 'days'), moment()],
                            'Next Year': [moment().add(365, 'days'), moment()],
                        }
                    },
                    function(start, end, label) {
                        /* var years = moment().diff(start, 'years');
                         alert("You are " + years + " years old.");*/
                    });
            }
      }
    }
});
