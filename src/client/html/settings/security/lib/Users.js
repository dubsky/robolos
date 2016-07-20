UserCollection = new Mongo.Collection("userAccounts");

UserCollection.getUserName=function(userDocument) {
    if(userDocument.username!==undefined) return userDocument.username;
    if(userDocument.emails!=undefined && userDocument.emails.length>0)
        return userDocument.emails[0].address;
    return userDocument._id;
}