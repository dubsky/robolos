Collections.Keywords = CollectionManager.Collection("keywords");
Collections.Keywords.KEYWORD_DOCUMENT_ID='keywords';

Schemas.Keywords=new SimpleSchema({
    keywords: {
        type: [String],
        max: 64
    }
});

Collections.Keywords.attachSchema(Schemas.Keywords);