Template.about.onRendered(function() {

    // lazy load images
    $('.image').visibility({
        type: 'image',
        transition: 'vertical flip in',
        duration: 500
    });

});

Router.route('about');