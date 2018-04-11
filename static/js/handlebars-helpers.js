Handlebars.registerHelper ('truncate', function (str, len) {
    if (str.length > len) {
        var new_str = str.substr (0, len+1);

        while (new_str.length) {
            var ch = new_str.substr ( -1 );
            new_str = new_str.substr ( 0, -1 );

            if (ch == ' ') {
                break;
            }
        }

        if ( new_str === '' ) {
            new_str = str.substr ( 0, len );
        }

        return new Handlebars.SafeString ( new_str +'...' );
    }
    return str;
});

Handlebars.registerHelper('replaceSlash', function(passedString) {
    var theString = passedString.substring(0,150);
    return new Handlebars.SafeString(passedString.replace('/', '-'));
});

Handlebars.registerHelper('dateFormatter', function(rfc822Date) {
    var d = new Date(Date.parse(rfc822Date));
    return new Handlebars.SafeString(d.toLocaleString());
});

Handlebars.registerHelper('humanFileSize', function(bytes, si) {
    return humanFileSize(bytes, si);
});

Handlebars.registerHelper('encode', function(string) {
	return encodeURIComponent( string );
});
