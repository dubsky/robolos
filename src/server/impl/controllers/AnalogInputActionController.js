AnalogInputActionController=class AnalogInputActionController extends Controller {


    constructor(sensor,meta) {
        super();
        this.sensor=sensor;
        this.meta=meta;
        this.sensitivity=meta.sensitivity;
        this.belowLimit=false;
        this.aboveLimit=false;
        if((typeof this.sensitivity)==='undefined') this.sensitivity=1;
    }


    event(value,timestamp) {

        if((typeof this.previousValue)==='undefined') {
            this.previousValue=value;
            return;
        }


        if(Math.abs(value-this.previousValue)>this.sensitivity) {
            this.previousValue=value;
            var meta=this.meta;
            if((typeof meta.onChangeAction)!=='undefined') {
                this.startAction(meta.onChangeAction);
            }

            if((typeof meta.fallsBelowValueLimit)!=='undefined') {
                if(!this.belowLimit && value<meta.fallsBelowValueLimit)
                {
                    if((typeof meta.fallsBelowAction)!=='undefined') {
                        this.belowLimit=true;
                        this.startAction(meta.fallsBelowAction);
                    }
                }
                else
                {
                    this.belowLimit=false;
                }
            }

            if((typeof meta.raisesAboveValueLimit)!=='undefined') {
                if(!this.aboveLimit && value>meta.raisesAboveValueLimit)
                {
                    if((typeof meta.raisesAboveAction)!=='undefined') {
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
