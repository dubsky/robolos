//import {log} from "../../api";
//
//
//    export class MQTTDriver {
//
//    static getDriverID() : string {
//        return 'MQTT Driver';
//    }
//
//    static getDescription() : string {
//        return 'Support for MQTT connected devices ';
//    }
//
//    /** Called when the driver is started and should start reporting sensor values and listening for actor changes */
//    start(parameters:any) {
//        // simulate updates from Temp sensor
//        var self=this;
//        log.info('Demo Driver: Driver Started');
//    }
//
//    stop(parameters:any) {
//        log.info('Demo Driver: Stopped');
//    }
//
//    /* For simplicity, there is only one virtual relay in this demo. This variable holds it's value */
//    constructor(driverInstanceDocument:any) {
//        //super();
//    }
//
//    /** Build list of sensors, called on driver instance start */
//    getSensors(): Array<any> {
//        return [];
//    }
//
//    /** Build list of devices, called on driver instance start  */
//    getDevices(): Array<any> {
//        var result=[
//            {
//                id:77,
//                keywords: ['Demo'],
//                revision: '1.5',
//                protocol: '1.2.1',
//                type:'Thermometer',
//                comment: 'Demo device'
//            }
//        ];
//        return result;
//    }
//
//    /**
//     * Called when user tries to remove a device from the UI. This is important if the driver is maintaining some persistent
//     * information on the device, which is not discoverable anymore and the user wants to get rid of it.
//     *
//     * @param id device id
//     */
//    removeDevice (id:string) {
//    }
//
//    /**
//     * Called when actor status change is requested
//     * @param deviceId device id
//     * @param sensorId sensor id
//     * @param action @see SENSOR_ACTIONS
//     * @param parameters @see SENSOR_ACTIONS
//     */
//    performAction(deviceId : string,sensorId: string,action:string,parameters:any)
//    {
//
//    }
//
//    /**
//     * @returns {string} meteor template name to create/update driver instance.
//     */
//    static getUIManagementBaseRoute() : string {
//        return 'manageDemoConnection';
//    }
//
//    /**
//     * @returns {string} path within the 'public' directory to the icon representing the driver. My return 'undefined' for an ugly icon
//     */
//    static getIconPath() : string {
//        return undefined;
//    }
//
//    /**
//     * @returns {boolean} true when the user is allow to create multiple instances of the driver in a single system
//     */
//    static allowsMultipleInstances() : boolean {
//        return true;
//    }
//
//
//
//}
