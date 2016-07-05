BinaryInputActionController=class BinaryInputActionController extends Controller {


    constructor(sensor,meta) {
        super();
        this.sensor=sensor;
        this.meta=meta;
        this.inHold=false;
        this.inDoubleClick=false;
    }

    event(value,timestamp) {
        var preprocessedValue=value;
        if(this.previousValue===preprocessedValue) return;
        let firstSensorInitialization=this.previousValue===undefined;
        this.previousValue=preprocessedValue;
        if(firstSensorInitialization) return;

        if(this.meta.holdAction!==undefined)
        {
            if(preprocessedValue) {
                this.inHold=true;
                this.holdTimeoutHandle=Meteor.setTimeout(() => {
                    this.startAction(this.meta.holdAction);
                    this.inHold=false;
                }, 3000);
            }
            else
            {
                if(this.inHold) {
                    Meteor.clearTimeout(this.holdTimeoutHandle);
                    this.inHold=false;
                    if(this.meta.delayTurnOnAction && this.meta.doubleClickAction===undefined) {
                        if(this.meta.turnOnAction!==undefined) this.startAction(this.meta.turnOnAction);
                    }
                }
            }
        }

        if(this.meta.doubleClickAction===undefined) {
            if(preprocessedValue)
            {
                if(this.meta.turnOnAction!==undefined && this.meta.holdAction!==undefined && !this.meta.delayTurnOnAction) this.startAction(this.meta.turnOnAction);
            }
            else
            {
                if (this.meta.turnOffAction!==undefined) this.startAction(this.meta.turnOffAction);
            }
        }
        else
        {
            if(preprocessedValue) {
                if(this.inDoubleClick)
                {
                    this.startAction(this.meta.doubleClickAction);
                    Meteor.clearTimeout(this.doubleClickHandle);
                    this.inDoubleClick=false;
                }
                else
                {
                    this.inDoubleClick=true;
                    this.doubleClickHandle=Meteor.setTimeout(() => {
                        this.inDoubleClick=false;
                        if (this.meta.turnOnAction!==undefined) this.startAction(this.meta.turnOnAction);
                        if (this.meta.turnOffAction!==undefined) this.startAction(this.meta.turnOffAction);
                    },500);
                }
            }
            else {
                if (!this.inDoubleClick && this.meta.turnOffAction!==undefined) this.startAction(this.meta.turnOffAction);
            }
        }
    }
}
