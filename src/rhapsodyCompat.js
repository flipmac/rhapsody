/*jslint nomen: true, plusplus: true, maxlen: 80 */
rhapsody.define("rhapsody.compat", function (Arrays) {
    "use strict";

    var bind, every, create, some, trim,
        ArrayProto = Array.prototype;

    if (Function.prototype.bind) {
        bind = function (thisArg) {
            Function.prototype.bind.apply(thisArg, ArrayProto.slice.
                    call(arguments, 1));
        };
    } else {
        bind = function () {
            var args = ArrayProto.slice.call(arguments),
                fun = args.shift(),
                thisArg = args.shift();

            if (typeof fun !== "function") {
                throw new TypeError(fun + " is not a function.");
            }

            return function () {
                return fun.apply(thisArg, args.concat(ArrayProto.slice.
                        call(arguments)));
            };
        };
    }

    if (Object.create) {
        create = function (o) {
            if (arguments.length !== 1) {
                throw new Error("Object.create only supports one argument.");
            }
            return Object.create(o);
        };
    } else {
        create = (function () {

            function F() {}

            return function (o) {
                if (arguments.length !== 1) {
                    throw new Error("Object.create only supports one argument" +
                            ".");
                }
                if (typeof o !== "function") {
                    throw new TypeError("argument must be a function.");
                }

                F.prototype = o;
                return new F();
            };
        }());
    }

    function everySomeTemplate(some) {
        return function (arr, callback, thisArg) {
            var i, len;

            if (typeof arr !== "object") {
                throw new TypeError("argument must be an array");
            }

            len = arr.length;

            if (!(typeof len === "number" && len % 1 === 0)) {
                throw new TypeError("argument must be an array");
            }

            for (i = 0; i < len; i++) {
                /*jslint eqeq: true */
                if (arr[i] !== undefined &&
                        callback.call(thisArg, arr[i], i, arr) == some) {
                    return false;
                }
            }
            return true;
        };

    }

    if (ArrayProto.every) {
        every = function (arr) {
            return ArrayProto.every.apply(arr, ArrayProto.slice.call(arguments,
                    1));
        };
    } else {
        every = everySomeTemplate(false);
    }

    if (ArrayProto.some) {
        some = function (arr) {
            return ArrayProto.some.apply(arr, ArrayProto.slice.call(arguments,
                    1));
        };
    } else {
        some = everySomeTemplate(true);
    }

    function forEach(iteratee, callback, scope) {
        var propertyName;

        if (Arrays.isArray(iteratee)) {
            return Arrays.forEach(iteratee, callback, scope);
        }

        if (typeof iteratee !== "object") {
            throw new rhapsody.RhapsodyError("iteratee has to be an object");
        }
        if (typeof callback !== "function") {
            throw new rhapsody.RhapsodyError("callback must be a function");
        }
        if (typeof scope !== "object") {
            throw new rhapsody.RhapsodyError("scope must be an object");
        }

        for (propertyName in iteratee) {
            if (iteratee.hasOwnProperty(propertyName)) {
                callback.call(scope, iteratee[propertyName], propertyName,
                        iteratee);
            }
        }

    }

    function checkString(str) {
        if (typeof str !== "string") {
            throw new rhapsody.RhapsodyError("argument must be a string");
        }
        return str;
    }

    trim = "".trim ? function (str) {
        return checkString(str).trim();
    } : function (str) {
        return checkString(str).replace(/^\s+|\s+$/, "");
    };

    return {
        bind: bind,
        create: create,
        every: every,
        forEach: forEach,
        isArray: Arrays.isArray,
        map: Arrays.map,
        some: some,
        trim: trim
    };

}, ["rhapsody.arrays"]);