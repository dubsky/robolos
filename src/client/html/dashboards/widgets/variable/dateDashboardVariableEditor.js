Template.dateDashboardVariableEditor.onSave=function(formId,variableId) {
    var newValue=document.forms[formId].elements['value'].value;
    var dateValue=moment(newValue,'MM/DD/YYYY h:mm A').toDate();

    var auto=$('#'+formId+' .autoCheckbox');
    if(auto.length>0) {
        Meteor.call('updateVariable', {$set: { dateValue: dateValue, allowAutomaticControl: auto.checkbox('is checked') } },variableId);
    }
    else
    {
        Meteor.call('updateVariable', {$set: { dateValue: dateValue } },variableId);
    }
    $('.popupEditor').popup('hide');
}

Template.dateDashboardVariableEditor.onCancel=function(formId,variableId) {
        $('.popupEditor').popup('hide');
}