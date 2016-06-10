

class KeywordsUIClass extends Observable {

    start() {
        this.keywordsDocument=Collections.Keywords.findOne(Collections.Keywords.KEYWORD_DOCUMENT_ID);
        if(this.keywordsDocument===undefined) {
            this.keywordsDocument={_id:Collections.Keywords.KEYWORD_DOCUMENT_ID,keywords: []};
            Collections.Keywords.insert(this.keywordsDocument);
        }
    }

    addKeywords(keywords) {
        //log.debug('add keywords',keywords);
        //log.debug('before update',this.keywordsDocument);
        let updateNeeded=false;
        for(let i=0;i<keywords.length;i++) {
            let keyword=keywords[i];
            if(keyword===null || keyword==='') continue;
            let currentSet=this.keywordsDocument.keywords;
            let keywordResolved=false;
            for(var j=0;j<currentSet.length;j++) {
                let current=currentSet[j];
                if(keyword===current) {
                    keywordResolved=true;
                    break;
                }
                //log.debug(keyword+'<'+current+'='+(keyword<current));
                if(keyword<current) {
                    currentSet.splice(j, 0, keyword);
                    updateNeeded=true;
                    keywordResolved=true;
                    break;
                }
            }
            if(!keywordResolved) {
                currentSet[currentSet.length]=keyword;
                updateNeeded=true;
            }
        }
        if(updateNeeded) {
            Collections.Keywords.update(Collections.Keywords.KEYWORD_DOCUMENT_ID,{$set : { keywords : this.keywordsDocument.keywords}});
            //log.debug('after update',this.keywordsDocument);
            this.fireUpdateEvent(this.keywordsDocument);
        }
    }

    resetKeywords() {
        this.keywordsDocument.keywords=[];
        Collections.Keywords.update(Collections.Keywords.KEYWORD_DOCUMENT_ID,{$set : { keywords : this.keywordsDocument.keywords}});
        this.fireUpdateEvent(this.keywordsDocument);
    }

}

KeywordsUI=new KeywordsUIClass();


Meteor.publish("keywords", function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    self.added("keywords",Collections.Keywords.KEYWORD_DOCUMENT_ID, this.keywordsDocument);
    self.ready();

    var id=KeywordsUI.addEventListener({
        onUpdate : function(keywords) {
            self.changed("keywords",Collections.Keywords.KEYWORD_DOCUMENT_ID, keywords);
        }
    });

    self.onStop(function(){
        KeywordsUI.removeEventListener(id);
    });
});



Meteor.methods({
    addKeywords: function(keywords) {
        KeywordsUI.addKeywords(keywords);
    },

    resetKeywords: function(keywords) {
        KeywordsUI.resetKeywords();
    }

});

Meteor.startup(function() {
    KeywordsUI.start();
});
