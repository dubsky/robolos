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
        this.previousValue=preprocessedValue;

        if(this.meta.holdAction!==undefined)
        {
            if(preprocessedValue) {
                this.inHold=true;
                this.holdTimeoutHandle=setTimeout(function() {
                    this.startAction(this.meta.holdAction);
                    this.inHold=false;
                },3000);
            }
            else
            {
                if(this.inHold) {
                    clearTimeout(this.holdTimeoutHandle);
                    this.inHold=false;
                    if(this.meta.delayTurnOnAction) {
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
                if(this.meta.turnOffAction!==undefined) this.startAction(this.meta.turnOffAction);
            }
        }
        else
        {
            if(preprocessedValue) {
                if(this.inDoubleClick)
                {
                    this.startAction(this.meta.doubleClickAction);
                    clearTimeout(this.doubleClickHandle);
                    this.inDoubleClick=false;
                }
                else
                {
                    this.doubleClickHandle=setTimeout(function() {
                        if (this.meta.turnOnAction!==undefined) this.startAction(this.meta.turnOnAction);
                        this.inDoubleClick=false;
                    },500);
                }
            }
            else {
                if (!this.inDoubleClick && this.meta.turnOffAction!==undefined) this.startAction(this.meta.turnOffAction);
            }
        }
    }



}
