Meteor.publish("settings", function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    self.added("settings",Collections.Settings.SETTINGS_DOCUMENT_ID, Settings.get());
    self.ready();

    var id=Settings.addEventListener({
        onUpdate : function(settings) {
            self.changed("settings",Collections.Settings.SETTINGS_DOCUMENT_ID, settings);
        }
    });

    self.onStop(function(){
        Settings.removeEventListener(id);
    });
});



Meteor.methods({
    updateSettings: function(settings) {
       Settings.update(settings);
    }
});
