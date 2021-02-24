let getParams = function(key){
    const params = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }

        params[decode(arguments[1])] = decode(arguments[2]);
    });

    return params[key];
};