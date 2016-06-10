Template.modal.helpers({
    activeModal: function() {
        //console.log("modal changed:",Template.modal.current.get());
        return Template.modal.current.get();
    },

});

Template.modalBackup.helpers({
    activeModal: function() {
        return Template.modalBackup.current.get();
    },
});

Template.modal.current=new ReactiveVar(false);
Template.modalBackup.current=new ReactiveVar(false);




SemanticUI={ modal:
    function(selector,onShow,onHidden) {
        $('.popupEditor').popup('hide all');
        return $(selector).modal(
            {
                allowMultiple:true,
                detachable:false,
                observeChanges:true,
                onVisible: onShow,
                onHidden: function() {
                    if(onHidden!==undefined) onHidden();
                    Template.modal.current.set(null);
                }
            }).modal('show').modal('refresh');
    },
    modal2ndLayer:
        function(selector,onShow,onHidden) {
            $('.popupEditor').popup('hide all');
            return $(selector).modal(
                {
                    allowMultiple:true,
                    detachable:false,
                    observeChanges:true,
                    onVisible: onShow,
                    onHidden: function() {
                        if(onHidden!==undefined) onHidden();
                        Template.modalBackup.current.set(null);
                    }
                }).modal('show').modal('refresh');
        }
}