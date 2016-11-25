ACTION_RENDERING_MODE={ PROPERTIES:'properties', CODE:'code'};
INITIAL_ACTION_RENDERING_MODE=ACTION_RENDERING_MODE.CODE;

Template.actionLink.helpers({
    route() {
        if(INITIAL_ACTION_RENDERING_MODE===ACTION_RENDERING_MODE.PROPERTIES) return '/action-properties/'; else return '/actions/';
    }
});