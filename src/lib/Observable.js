Observable=class Observable {

    constructor() {
        this.listeners={
            listenerObjects: [],
            idGenerator:0
        };
    }

    addEventListener(listener) {
        var id=this.listeners.idGenerator++;
        this.listeners.listenerObjects[id]=listener;
        return id;
    }

    removeEventListener(id) {
        delete this.listeners.listenerObjects[id];
    }

    fireRemoveEvent(id) {
        for(var i in this.listeners.listenerObjects) {
            var f=this.listeners.listenerObjects[i];
            if(f.onRemove!==undefined) f.onRemove(id);
        }
    }

    fireUpdateEvent(o) {
        for(var i in this.listeners.listenerObjects) {
            var f=this.listeners.listenerObjects[i];
            if(f.onUpdate!==undefined) f.onUpdate(o);
        }
    }

    fireCreateEvent(o) {
        for(var i in this.listeners.listenerObjects) {
            var f=this.listeners.listenerObjects[i];
            if(f.onCreate!==undefined) f.onCreate(o);
        }
    }

}
