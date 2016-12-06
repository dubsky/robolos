class CollectionProxy {

    constructor(collectionName) {
        this.collectionName=collectionName;
        //this.collection=new Mongo.Collection(this.collectionName);
    }

    onConnectionChange(connection) {
        this.collection=new Mongo.Collection(this.collectionName,connection);
        if(this.schema!==undefined) this.collection.attachSchema(this.schema);
    }

    attachSchema(schema) {
        this.schema=schema;
        if(this.collection!==undefined) this.collection.attachSchema(schema);
    }

    check() {
        //should not happen; we should get blocked on subscribe/call
        if(this.collection===undefined) throw new Error('No connection yet');
    }

    //IOS doesn't support Proxy yet...
    find() {
        this.check();
        return this.collection.find.apply(this.collection,arguments);
    }

    findOne() {
        this.check();
        return this.collection.findOne.apply(this.collection,arguments);
    }

    insert() {
        this.check();
        return this.collection.insert.apply(this.collection,arguments);
    }

    update() {
        this.check();
        return this.collection.update.apply(this.collection,arguments);
    }

    upsert() {
        this.check();
        return this.collection.upsert.apply(this.collection,arguments);
    }

    remove() {
        this.check();
        return this.collection.remove.apply(this.collection,arguments);
    }

    allow() {
        this.check();
        return this.collection.allow.apply(this.collection,arguments);
    }

    deny() {
        this.check();
        return this.collection.deny.apply(this.collection,arguments);
    }

    rawCollection() {
        this.check();
        return this.collection.rawCollection.apply(this.collection,arguments);
    }

    rawDatabase() {
        this.check();
        return this.collection.rawDatabase.apply(this.collection,arguments);
    }
}


class CollectionManagerClass {

    constructor() {
        this.collections={};
    }

    Collection(name) {
        if(Meteor.isServer) {
            return new Mongo.Collection(name);
        }
        else {
            if(this.collections[name]!==undefined) throw Exception('Collection '+name+' created twice !');
            let proxy=new CollectionProxy(name);
            if(this.connection!==undefined) proxy.onConnectionChange(this.connection);
            this.collections[name]=proxy;
            return proxy;
        }
    }

    onConnectionChange(connection) {
        this.connection=connection;
        console.log('onConnectionChange');
        for(let collection in this.collections) {
            let proxy=this.collections[collection];
            proxy.onConnectionChange(connection);
        }
    }
}

CollectionManager=new CollectionManagerClass();