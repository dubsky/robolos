Router.route('enableAlexa');

function getUrlParams() {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    var urlParams = {};
    while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams;
}

Template.enableAlexa.helpers({

    valid() {
        var urlParams = getUrlParams();
        return !(urlParams.client_id===undefined || urlParams.redirect_uri===undefined || urlParams.response_type===undefined);
    }
});

Template.enableAlexa.events( {
    'click .authorize': function() {
        console.log('Authorize button clicked.');
        var urlParams = getUrlParams();

        // create an authorization code for the provided client.
        oAuth2Server.callMethod.authCodeGrant(
            urlParams.client_id,
            urlParams.redirect_uri,
            urlParams.response_type,
            urlParams.scope && urlParams.scope.split(' '),
            urlParams.state,
            function(err, result) {
                console.log(err, result);
                // give the UI something to display.
                grantResult.set(result);
                Router.go('homepage');
            }
        );
    },
});