App.subscribeNoCaching('keywords');

Template.keywordInputType.helpers({
    keywords: function() {
        let keywordDoc=Collections.Keywords.findOne(Collections.Keywords.KEYWORD_DOCUMENT_ID);
        if(keywordDoc===undefined) return undefined;
        return keywordDoc.keywords;
    }
});

Template.keywordInputType.onRendered(function() {
    $('.keywordEditor')
        .dropdown({
            allowAdditions: true
        });
});


AutoForm.addInputType('keywords',{

    template: 'keywordInputType',
    valueIn:function(value,typeFieldInfo) {
        if(value.join===undefined) return value;
        return value.join(',');
    },

    valueOut:function() {
        try {
            //console.log(this.val());
            var keywords=this.val().split(',');
            if(this.val().trim()=='') return [];
            let keywordDoc=Collections.Keywords.findOne(Collections.Keywords.KEYWORD_DOCUMENT_ID);
            if(keywordDoc.keywords===undefined) keywordDoc.keywords=[];
            //console.log('keywordDoc',keywordDoc);
            //console.log('keywords',keywords);
            let newKeywords=[];
            for(let i=0;i<keywords.length;i++) {
                let originalKeyword=keywords[i].trim();
                let keyword=originalKeyword.toLowerCase();
                let found=false;
                for(let j=0;j<keywordDoc.keywords.length;j++) {
                    if(keywordDoc.keywords[j]!==null && keywordDoc.keywords[j].toLowerCase()===keyword) {
                        found=true;
                        break;
                    }
                }
                if(!found) newKeywords[newKeywords.length]=originalKeyword;
            }
            //console.log(newKeywords);
            if(newKeywords.length!==0) Meteor.call("addKeywords", newKeywords);
            return keywords;
        }
        catch(e)
        {
            console.log(e);
        }
    }
});
