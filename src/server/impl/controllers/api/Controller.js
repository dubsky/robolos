Controller=class Controller {

    startAction(actionId) {
        if((typeof actionId)!=='undefined') {
            var action = ActionsInstance.getAction(actionId);
            if ((typeof action) !== 'undefined') {
                ActionsInstance.startAction(action);
            }
        }
    }

    event(value,timestamp) {

    }

}