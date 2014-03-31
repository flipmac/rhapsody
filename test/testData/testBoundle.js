rhapsody.define("rhapsodyTestUtils.module1", function () {

    return {
        test: function () {
            return true;
        }
    };

});

rhapsody.define("rhapsodyTestUtils.module2", function () {

    return {
        test: function () {
            return false;
        }
    };

});

rhapsody.define("rhapsodyTestUtils.module3", function () {

    return {
        test: function () {
            return "hello";
        }
    };

});