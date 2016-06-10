Meteor.startup(function() {
    AutoForm.setDefaultTemplate("semanticUI");
    Uploader.uploadUrl = Meteor.absoluteUrl("upload"); // Cordova needs absolute URL
});


