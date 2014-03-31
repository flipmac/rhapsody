// misc utils
var utils = (function () {
    "use strict";

    var api = {};

    function getTestData(fileName) {
        return window.location.href.split("/rhapsody/")[0] + "/rhapsody/" +
                "test/testData/" + fileName;
    }

    api.getTestData = function (fileName) {
        var arr, i;

        if (typeof fileName === "string") {
            return getTestData(fileName);
        }
        arr = [];

        for (i = 0; i < fileName.length; i++) {
            arr.push(getTestData(fileName[i]));
        }

        return arr;
    };

    api.getScriptSrcs = function () {
        var i,
            srcs = [],
            scripts = document.getElementsByTagName("SCRIPT");

        for (i = 0; i < scripts.length; i++) {
            srcs.push(scripts[i].src);
        }

        return srcs;
    };

    return api;

})();