Template.numberDashboardVariableEditor.onSave=function(formId,variableId) {
    var newValue=document.forms[formId].elements['value'].value;

    var intValue=parseFloat(newValue);

    if(isNaN(intValue))
    {
        var auto=$('#'+formId+' .autoCheckbox');
        if(auto.length>0) {
            Meteor.call('updateVariable', {$set: { numberValue: newValue, allowAutomaticControl: auto.checkbox('is checked') } },variableId);
        }
        else
        {
            Meteor.call('updateVariable', {$set: { numberValue: newValue } },variableId);
        }
        $('.popupEditor').popup('hide');

    }
}

Template.numberDashboardVariableEditor.onCancel=function(formId,variableId) {
    $('.popupEditor').popup('hide');
}
