(function () {

    var module = ["rhapsody.event"];

testRhapsody("package exist", function (tester) {

    var e;

    tester.addStep(function (Asserts) {
        rhapsody.use(module, function (Events) {
            e = Events;
        });
        Asserts.assert("e !== undefined", e !== undefined);
    });

});

testRhapsody("test on", function (tester) {

    var savedResult, savedError,
        userId = "123",
        userName = "Kalle",
        message = "added user";

    rhapsody.use(module, function (Events) {
        tester.addStep(function () {
            var ev = Events.addEvent("ADD_USER", ["user_id", "user_name"]);

            ev.on(function (userId, userName, responseBack) {
                responseBack(null, {
                    message: message,
                    data: {
                        userId: userId,
                        userName: userName
                    }
                });
            });

            ev.fire({
                    user_id: userId,
                    user_name: userName
                },
                function (err, result) {
                    savedError = err;
                    savedResult = result;
                });

        }).addStep(function (Asserts) {
            Asserts.assert("typeof savedResult === 'object'",
                    typeof savedResult === "object");
            Asserts.assertEquals("savedResult.message === '" + message +
                        "'", message, savedResult.message);
            Asserts.assert("typeof savedResult.data === 'object'",
                    typeof savedResult.data === "object");
            Asserts.assertEquals("savedResult.data.userId === userId", userId,
                    savedResult.data.userId);
            Asserts.assertEquals("savedResult.data.userName === userName", userName,
                    savedResult.data.userName);
            Asserts.assert("savedError === null", savedError === null);
        }).tearDown(function () {
            Events.deleteEvent("ADD_USER");
        });
    });

});

}());