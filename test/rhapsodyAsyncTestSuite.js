/*
 * Global variable for test data files to write to.
 */
var testDataContainer = {};

testRhapsody("test rhapsody.ajax basic", function (tester) {

    tester.addStep(function (Asserts) {
        rhapsody.use(["rhapsody.ajax"], function (Ajax) {
            Asserts.isTrue("Ajax is defined.", typeof Ajax === "object");
            Asserts.isTrue("Ajax.loadScripts is a function", typeof Ajax.
                    loadScripts === "function");
        });
    });
});

testRhapsody("test load one script", function (tester) {

    var testDataFileName = "rhapsodyAsyncTestData1.js";

    tester.addStep(function () {
        rhapsody.use(["rhapsody.ajax"], function (Ajax) {
            Ajax.loadScripts(utils.getTestData(testDataFileName), function () {
                tester.proceed();
            });
        });
    }).pause(1500).addStep(function (Assert) {
        Assert.isContains(utils.getScriptSrcs().join(", "), testDataFileName);
        Assert.isTrue("script got executed", testDataContainer.
                rhapsodyAsyncTestData1WasLoaded);
    }).tearDown(function () {
        testDataContainer = {};
    });
});

testRhapsody("test load many scripts", function (tester) {

    var dataFiles = utils.getTestData(["rhapsodyAsyncTestData2.js",
            "rhapsodyAsyncTestData3.js", "rhapsodyAsyncTestData4.js"]);

    tester.addStep(function () {
        rhapsody.use(["rhapsody.ajax"], function (Ajax) {
            Ajax.loadScripts(dataFiles, function () {
                tester.proceed();
            });
        });
    }).pause(1500).addStep(function (Assert) {
        Assert.isContainsAll(utils.getScriptSrcs(), dataFiles);
        Assert.isTrue("script1 got loaded", testDataContainer.
                rhapsodyAsyncTestData2WasLoaded);
        Assert.isTrue("script2 got loaded", testDataContainer.
                rhapsodyAsyncTestData3WasLoaded);
        Assert.isTrue("script3 got loaded", testDataContainer.
                rhapsodyAsyncTestData4WasLoaded);
    }).tearDown(function () {
        testDataContainer = {};
    });
});

testRhapsody("test error cases", function (tester) {

    tester.addStep(function (Assert) {
        rhapsody.use(["rhapsody.ajax"], function (Ajax) {
            Assert.isTrue("Ajax.loadScripts(undefined) should fail", Assert.
                    isFailure(Ajax.loadScripts, [undefined], rhapsody.
                    RhapsodyError));
            Assert.isTrue("Ajax.loadScripts([]) should fail", Assert.
                    isFailure(Ajax.loadScripts, [[]], rhapsody.
                    RhapsodyError));
            Assert.isTrue("Ajax.loadScripts(['hello', null, 'world']) should " +
                    " fail", Assert.isFailure(Ajax.loadScripts, [["hello", null,
                    "world"]], rhapsody.RhapsodyError));
        });
    });

});

testRhapsody("rhapsody.defineBundles basics", function (tester) {
    tester.addStep(function (Assert) {
        Assert.isTrue("rhapsody.defineBundles is defined", "defineBundles" in
                rhapsody);
        Assert.isTrue("rhapsody.defineBundles is function", typeof rhapsody.
                defineBundles === "function");
    });
});


testRhapsody("rhapsody._async basics", function (tester) {

    var module = null,
        moduleName = "rhapsodyTestUtil.testModule1"
        testModuleUrl = utils.getTestData("testModule.js");

    tester.addStep(function () {
        var bundles = {};
        bundles[testModuleUrl] = [moduleName];
        rhapsody.defineBundles(bundles);
    }).addStep(function () {
        rhapsody.use(moduleName, function (m) {
            module = m;
            tester.proceed();
        });
    }).pause(1500).addStep(function (Assert) {
        Assert.isTrue("module is defined", !!module);
        Assert.isTrue("module.meth is a function", typeof module.meth ===
                "function");
        Assert.isTrue("module.meth() returns true", module.meth() === true);
    });
});


testRhapsody("rhapsody._async load one from bundle", function (tester) {

    var arg, module1, module2, module3, oldAjax,
        module1Name = "rhapsodyTestUtils.module1",
        module2Name = "rhapsodyTestUtils.module2",
        module3Name = "rhapsodyTestUtils.module3",
        testBundleUrl = utils.getTestData("testBoundle.js");

    tester.addStep(function () {
        var bundles = {};
        bundles[testBundleUrl] = [module1Name, module2Name, module3Name];
        rhapsody.defineBundles(bundles);
    }).addStep(function () {
        var once;

        function proceedWhenCalledTwice() {
            if (once) {
                tester.proceed();
            } else {
                once = true;
            }
        }

        rhapsody.use(module3Name, function (m) {
            module3 = m;
            proceedWhenCalledTwice();
        });
        rhapsody.use(module2Name, function (m) {
            module2 = m;
            proceedWhenCalledTwice();
        });

    }).pause(1500).addStep(function (Assert) {
        Assert.isEqual("hello", module3.test());
        Assert.isEqual(false, module2.test());
    });
});



