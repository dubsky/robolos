AnalogInputActionController=class AnalogInputActionController extends Controller {


    constructor(sensor,meta) {
        super();
        this.sensor=sensor;
        this.meta=meta;
        this.sensitivity=meta.sensitivity;
        this.belowLimit=false;
        this.aboveLimit=false;
        if(this.sensitivity===undefined) this.sensitivity=1;
    }


    event(value,timestamp) {

        let meta=this.meta;
        if(this.previousValue==='undefined') {
            this.previousValue=value;
            if(meta.onChangeAction!==undefined) {
                this.startAction(meta.onChangeAction);
            }
            return;
        }


        if(Math.abs(value-this.previousValue)>this.sensitivity) {
            this.previousValue=value;
            if(meta.onChangeAction!==undefined) {
                this.startAction(meta.onChangeAction);
            }

            if(meta.fallsBelowValueLimit!==undefined) {
                if(!this.belowLimit && value<meta.fallsBelowValueLimit)
                {
                    if(meta.fallsBelowAction!==undefined) {
                        this.belowLimit=true;
                        this.startAction(meta.fallsBelowAction);
                    }
                }
                else
                {
                    this.belowLimit=false;
                }
            }

            if(meta.raisesAboveValueLimit!==undefined) {
                if(!this.aboveLimit && value>meta.raisesAboveValueLimit)
                {
                    if(meta.raisesAboveAction!==undefined) {
                        this.aboveLimit=true;
                        this.startAction(meta.raisesAboveAction);
                    }
                }
                else
                {
                    this.aboveLimit=false;
                }
            }

        }
    }
}
