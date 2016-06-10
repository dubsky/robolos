DateUtils={

    getAtDateString : function(stamp,preposition) {
        if((typeof stamp)==='undefined') return 'Unknown';

        var t=new Date(stamp);
        var now=new Date();

        if(t.getDate()===now.getDate() && t.getMonth()===now.getMonth() && t.getFullYear()=== now.getFullYear())
        {
            var text=t.toLocaleTimeString();
            let c=text.indexOf(' ');
            if(c>0) text=text.substring(0,c);
            return (preposition ? "at " : "" )+text;
        }
        return (preposition ? "on " : "" )+t.toLocaleDateString();
    },

    getDateString : function(stamp) {
        return this.getAtDateString(stamp,false);
    }


}
