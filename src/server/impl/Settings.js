class SettingsClass extends Observable {

    start() {
        this.settingsDocument=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
        if(this.settingsDocument===undefined) {
            this.settingsDocument={_id:Collections.Settings.SETTINGS_DOCUMENT_ID};
            Collections.Settings.insert(this.settingsDocument);
        }
        Schemas.Settings.clean(this.settingsDocument);
    }

    get() {
        return this.settingsDocument;
    }

    update(settings) {
        Collections.Settings.update(Collections.Settings.SETTINGS_DOCUMENT_ID,settings);
        this.settingsDocument=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
        this.fireUpdateEvent(this.settingsDocument);
    }
}

Settings=new SettingsClass();



