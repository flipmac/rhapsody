/*jslint nomen: true, plusplus: true */
/*rapsody rhapsodyAjax*/
/**
* Used to define modules by it's url.
*/
// internal loading functions
rhapsody.use("rhapsody.arrays", function (Arrays) {
    "use strict";

    var _loadedUrls = {},
        _moduleNamesToUrls = {},

        throwError = function (message) {
            throw new rhapsody.RhapsodyError(message);
        };

    /**
    * Define a collection of boundles consiting of mapped to
    * it's urls.
    *
    * Example:
    *
    *     rhapsody.defineBundles({
    *           "/something/allMyModules.js": ["my.module1", "my.module2"],
    *           "/something/otherModules.js": ["my.module3", "my.module4"],
    *           "/something/Extended.js": ["myExt.module"]
    *     });
    */
    rhapsody.defineBundles = function (bundles) {
        var moduleNames,
            url;

        for (url in bundles) {

            if (bundles.hasOwnProperty(url)) {
                moduleNames = bundles[url];

                if (!Arrays.isArray(moduleNames)) {
                    throwError("url <" + url + "> was not mapped to an array");
                }

                Arrays.forEach(moduleNames, function (moduleName) {

                    if (typeof moduleName !== "string") {
                        throwError("the boundle <" + url + "> contained non-" +
                                "string moduleName <" + moduleName + ">");
                    }
                    _moduleNamesToUrls[moduleName] = url;
                });
            }
        }
    };

    rhapsody.define("rhapsody._async", function (Ajax) {

        // internal function used for loading the modules.
        return function (moduleNames) {
            var urls = [];

            Arrays.forEach(moduleNames, function (moduleName) {
                var url = _moduleNamesToUrls[moduleName];

                if (!(url in _loadedUrls)) {
                    _loadedUrls[url] = true;
                    urls.push(url);
                }
            });

            if (urls.length > 0) {
                Ajax.loadScripts(urls);
            }
        };

    }, ["rhapsody.ajax"]);
});

