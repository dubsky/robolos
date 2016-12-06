let LOCAL_STORAGE_KEY="robolos.client.configuration";

class ClientConfigurationClass {

    get() {
        var storage = window.localStorage;
        var value = storage.getItem(LOCAL_STORAGE_KEY);
        console.log(value);
        return value==undefined ? {}: EJSON.parse(value);
    }

    set(config) {
        var storage = window.localStorage;
        storage.setItem(LOCAL_STORAGE_KEY, EJSON.stringify(config));
    }

    getServerBaseUrl() {
        let config=this.get();
        return config.baseURL;
    }
}

ClientConfiguration=new ClientConfigurationClass();