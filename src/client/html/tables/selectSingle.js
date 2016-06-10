TableSingleSelectionHandler=function (sessionKey, event ,id) {

    var selection=Session.get(sessionKey);
    if((typeof selection)==='undefined'||selection===null) {
        selection=id;
        $(event.target.parentNode).addClass("active");
    }
    else
    {
        var test;
        if(selection instanceof Object) test=selection.toString()===id.toString();
            else test=selection==id;
        if(test)
        {
            $(event.target.parentNode).removeClass("active");
            selection=null;

        }
        else
        {
            var tbody=event.target.parentNode.parentNode;
            for(var i=0;i<tbody.childNodes.length;i++)
            {
                var child=tbody.childNodes[i];
                $(child).removeClass("active");
            }
            selection=id;
            $(event.target.parentNode).addClass("active");
        }
    }

    Session.set(sessionKey,selection);
}