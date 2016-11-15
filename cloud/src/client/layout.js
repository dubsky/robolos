Template.layout.onRendered(function() {

    var fix=function () {
        var neg = 40; // header height
        var window_height = $(window).height();
        $("#content-wrapper").css('height', window_height - neg );
    };

    $(window, ".wrapper").resize(function () {
        fix();
    });

    fix();
});