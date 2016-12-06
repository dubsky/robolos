
Template.keywordSettings.helpers({
    keywordsReset: function () {
        return Session.get('Template.settings.keywordsReset');
    }
    /*
     collection: function() {
     return Collections.Schedules
     },

     schema: Schemas.Schedule
     */
});

Template.keywordSettings.onCreated(function() {
    Session.set('Template.settings.keywordsReset',false);
});

Template.keywordSettings.events({

    'click .resetKeywords' :function(event) {
        ConnectionManager.call('resetKeywords',function() {
            Session.set('Template.settings.keywordsReset',true);
        });
    }

});
