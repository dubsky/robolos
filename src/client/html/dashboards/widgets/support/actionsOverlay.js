Template.actionsOverlay.helpers({
    runningAction() {
        let widget=this.widget;
        let result=undefined;
        if(widget.actions!==undefined) {
            for(let i=0;i<widget.actions.length;i++) {
                let id=widget.actions[i];
                let actionData=SensorStatusCollection.findOne(id);
                if(actionData!=undefined) {
                    if(isActionRunning(actionData)) {
                        result=actionData;
                        break;
                    }
                }
            }
        }
        return { actionData : result, widget: { action: result===undefined ? undefined : result._id } };
    }

});

Template.actionsOverlay.events({

    'click .openActionsMenu' : function(e) {
        let actions=[];
        let widget=this.widget;
        for(let i=0;i<widget.actions.length;i++) {
            let id=widget.actions[i];
            let action=SensorStatusCollection.findOne(id);
            if(action!=undefined) {
                actions.push( {name: action.title, description:action.description, id:id} );
            }
        }

        let params={
            actions: actions
        };

        if(this.sensorData.class===SensorClasses.BINARY_OUTPUT) {
            params.switchOver={ driver:this.widget.driver,device:this.widget.device,sensor:this.widget.sensor};
        }

        let template = Blaze.toHTMLWithData(Template.actionsMenu, params);
        let target = $(e.currentTarget);
        $(target).popup({
            position: 'right center',
            hoverable: true,
            on: 'click',
            html: template,
            variation:'flowing',
            delay: {
                show: 300,
                hide: 800
            }
        });
        $(target).popup('show');
    }

});

Template.actionsOverlay.startAction=function(id) {
    Meteor.call('startAction', id);
};

Template.actionsOverlay.switchOver=function(driver, device, sensor) {
    Meteor.call('actionSwitchOver', driver, device, sensor);
};
