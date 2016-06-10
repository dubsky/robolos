Template.selectMultiple.rendered = function() {
    if (!this._rendered) {
        $('input').iCheck({
            checkboxClass: 'icheckbox_minimal',
            radioClass: 'iradio_minimal',
            increaseArea: '20%'
        });
    };

}


TableSelectionHandler=function (sessionKey, event, instance,id) {

    var selection=Session.get(sessionKey);
    if((typeof selection)==='undefined') {
        selection=[];
    }
    var index=selection.indexOf(id);
    if(index<0) {
        selection.push(id);
        $(event.target.parentNode).addClass("active");
    }
    else
    {
        selection.splice(index,1);
        $(event.target.parentNode).removeClass("active");
    }
    Session.set(sessionKey,selection);
}