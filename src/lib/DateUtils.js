DateUtils={

    getAtDateString : function(stamp,preposition) {
        if((typeof stamp)==='undefined') return 'Unknown';

        var t=new Date(stamp);
        var now=new Date();

        if(t.getDate()===now.getDate() && t.getMonth()===now.getMonth() && t.getFullYear()=== now.getFullYear())
        {
            // whose idea it was that t.toLocaleTimeString returns timezone ? v@#$$^%@@^#$
            var text=t.toLocaleTimeString();
            let c=text.indexOf(' ');
            if(c>0) {
                let rest=text.substring(c);
                text=text.substring(0,c);
                if(rest.indexOf('AM')>=0) text+=' AM';
                if (rest.indexOf('PM')>=0) text+=' PM';
            }
            return (preposition ? "at " : "" )+text;
        }
        return (preposition ? "on " : "" )+t.toLocaleDateString();
    },

    getDateString : function(stamp) {
        return this.getAtDateString(stamp,false);
    }


}
