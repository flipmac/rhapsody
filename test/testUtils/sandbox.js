var sandbox = (function () {

    var SANDBOX_ID = "sandbox";

    function getSandbox() {
        return document.getElementById(SANDBOX_ID);
    }

    return {
        get: getSandbox,

        setup: function () {
            var el;

            if (getSandbox()) {
                throw new Error("Cannot setup sandbox multiple times");
            }
            el = document.createElement("DIV");
            el.id = SANDBOX_ID;
            document.body.appendChild(el);
        },

        tearDown: function () {
            var el = getSandbox();

            if (el) {
                el.parentNode.removeChild(el);
            }
        }

    };

}());