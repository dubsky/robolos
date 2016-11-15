Meteor.methods({
    /**
     * OAUTH FLOW - Step C1.1
     * While you are not required to implement client addition in the same way, clients will have
     * to be available for the oauth2 process to work properly. That may mean running code on
     * Meteor.startup() to populate the db.
     * @param client
     */
    'addClient': function (client){
        console.log('addClient', client);
        oAuth2Server.collections.client.upsert(
            {
                clientId: client.clientId
            },
            {
                $set: client
            }
        );
    },

    /**
     * Exists purely for testing purposes.
     * @returns {any}
     */
    'clientCount': function() {
        return oAuth2Server.collections.client.find({}).count();
    },

    /**
     * Exists purely for testing purposes.
     */
    'deleteAllClients': function() {
        oAuth2Server.collections.client.remove({});
    }
});

CLIENT_ID='robolos-alexa';
CLIENT_NAME='Alexa home automation skill';
CLIENT_SECRET='velmitajneheslodnesnihodne';
REDIRECT_URI='http://localhost:3200/_oauth/MeteorOAuth2Server';

Meteor.startup(() =>{
    oAuth2Server.collections.client.remove({});
    oAuth2Server.collections.client.upsert(
        {
            clientId: CLIENT_ID
        },
        {
            $set: { clientId: CLIENT_ID, clientName:CLIENT_NAME,clientSecret:CLIENT_SECRET,redirectUri:REDIRECT_URI }
        }
    );

});