
/*
Template.layout.rendered = function() {

    var fix=function () {
            //Get window height and the wrapper height
            var neg = 40; // header height
            //console.log("neg:"+neg);
            var window_height = $(window).height();
            $("#content-wrapper").css('height', window_height - neg );//- $('.main-footer').outerHeight());
           // console.log(window_height - neg);
    };

    $(window, ".wrapper").resize(function () {
        fix();
    });

    fix();
}
*/
Template.layout.onRendered(function() {


    var fix=function () {
        //Get window height and the wrapper height
        var neg = 40; // header height
        //console.log("neg:"+neg);
        var window_height = $(window).height();
        $("#content-wrapper").css('height', window_height - neg );//- $('.main-footer').outerHeight());
        // console.log(window_height - neg);
    };

    $(window, ".wrapper").resize(function () {
        fix();
    });

    fix();

    HeightController.setup();

    $('#sidebarMenu')
        //.sidebar('setting', 'transition', 'scale down');
    .sidebar('setting', 'transition', 'push');


});

TOUCH_DEVICE=!!('ontouchstart' in window);