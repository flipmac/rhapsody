/*jslint nomen: true, plusplus: true */
/**
* Utilities to perform Ajax requests.
*/
rhapsody.define("rhapsody.ajax", function (Arrays) {
    "use strict";

    return {
        /**
        * Loads all scripts in the urls, calls onload function
        * when the scripts has been loaded.
        * @param
        *       urls (Array|String) one or many urls
        * @param
        *       onload the function to call when the script(s) has been
        *       loaded
        */
        loadScripts: function (urls, onload) {
            var fun, i, script,
                heads = document.getElementsByTagName("HEAD");

            if (heads.length === 0) {
                throw new rhapsody.RhapsodyError("Cannot load javascript, no " +
                        "head element");
            }

            if (typeof urls === "string") {
                urls = [urls];
            } else if (!Arrays.isArray(urls) || urls.length < 1) {
                throw new rhapsody.RhapsodyError("Illegal argument <" + urls +
                        ">");
            }
            i = urls.length;

            if (typeof onload === "function") {
                fun = function () {
                    i--;

                    if (i === 0) {
                        onload();
                    }
                };
            }

            Arrays.forEach(urls, function (url) {
                var script;

                if (typeof url !== "string") {
                    throw new rhapsody.RhapsodyError("Illegal argument " +
                            "<" + urls + ">");
                }

                script = document.createElement("script");
                script.src =  url;

                if (fun) {
                    script.onload = fun;
                    console.log(script.onloadDone);

                    script.onreadystatechange = function () {

                        if (script.readyState === "loaded") {
                            fun();
                        }
                    };

                }
                heads[0].appendChild(script);
            });
        }
    };

}, ["rhapsody.arrays"]);