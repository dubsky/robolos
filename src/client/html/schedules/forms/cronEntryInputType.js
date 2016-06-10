Template.cronEntryInputType.helpers({
   valueHolder : function() {
       return this.atts['data-schema-key'];
   }
});


removeCronEntry = function (i) {
    $($('#cron .cronEntry').get(i)).remove();
};

Template.cronEntryInputType.events({
    'click .addCron' : function() {
        var e=$('#cron');
        var newEntry=$('<div class="cronEntry inline fields"></div>');
        e.append(newEntry);
        console.log(newEntry);
        newEntry.cron({
            initial: "42 3 * * 5",
            useGentleSelect: false
        });
        newEntry.append('<button class="ui icon button" onclick="removeCronEntry('+($('#cron .cronEntry').size()-1)+')"><i class="remove icon"></i></button>');
    }
});

var initialValue=["42 3 * * 5"];

Template.cronEntryInputType.onRendered(function() {
    var e=$('#cron');
    for(var i=0;i<initialValue.length;i++) {
        var newEntry=$('<div class="cronEntry inline fields"></div>');
        e.append(newEntry);
        console.log(newEntry);
        newEntry.cron({
            initial: initialValue[i],
            onChange: function() {
            },
            useGentleSelect: false
        });
        if(i!=0) newEntry.append('<button class="ui icon button" onclick="removeCronEntry('+i+')"><i class="remove icon"></i></button>');
    }
});

AutoForm.addInputType('cronEntry',{
        template: 'cronEntryInputType',
        valueIn:function(v,x) {
            if(v!==null && (typeof v)!=='undefined' && v!=='') {
                initialValue=[];
                for(var i in v) {
                    initialValue[i]=CronExpression.getCronExpression(v[i]);
                }
            } else {
                initialValue=["42 3 * * 5"];
            }
        },
        valueOut:function() {
            try {
                var e=$('.cronEntry');
                var result=[];
                for(var i=0;i<e.size();i++) {
                    var v=$(e.get(i)).cron("value");
                    result[i]=CronExpression.encode(v.cron,v.text);
                }
                return result;
            }
            catch(e) { console.log(e); }
        }
});
