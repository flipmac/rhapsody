

testRhapsody("testRhapsodyTest", function (t) {

	var b;

	t.addStep(function (a) {
		setTimeout(function () {
			b = 1;
		}, 0)
	}).addStep(function (a) {
		a.isTrue("b === 1", b === 1);
	}).tearDown(function () {
		b == null;
	});

});

testRhapsody("module use", function (tester) {

	tester.addStep(function (T) {
		rhapsody.define("module1", function () {
				return {
					m: function () {
						return "a";
					}
				};
			});

		rhapsody.define("module2", function () {
			return {
				m: function () {
					return "b";
				}
			};
		});

		rhapsody.use(["module1", "module2"], function (m1, m2) {
			T.isTrue("m1.m() === 'a'", m1.m() === "a");
			T.isTrue("m2.m() === 'b'", m2.m() === "b");
		});
	}).tearDown(function () {
		rhapsody.undefine("module1", "module2");
	});

});


testRhapsody("async module use", function (tester) {

	var wasExecuted = false;

	tester.addStep(function () {
		rhapsody.use("module1", function () {
			wasExecuted = true;
		});
	}).addStep(function (t) {
		t.isTrue("!wasExecuted", !wasExecuted);
	}).tearDown(function () {
		rhapsody.undefine("module1");
	});

});

testRhapsody("async module use2", function (tester) {

	var wasExecuted = false;

	tester.addStep(function () {
		rhapsody.use("module1", function () {
			wasExecuted = true;
		});
	}).addStep(function () {
		rhapsody.define("module1", function () {
			return {};
		});
	}).addStep(function (t) {
		t.isTrue("wasExecuted", wasExecuted);
	}).tearDown(function () {
		rhapsody.undefine("module1");
	});

});

testRhapsody("async module use 3", function (tester) {

	var executed = false,
		module1Name = "module1",
		module2Name = "module2";

	tester.addStep(function () {
		rhapsody.use([module1Name, module2Name], function () {
			executed = true;
		});
	}).addStep(function (t) {
		rhapsody.define(module1Name, function () {
			return {};
		});
		t.isTrue("shouldn't be executed yet.", !executed);
		rhapsody.define(module2Name, function () {
			return {};
		});
	}).addStep(function (t) {
		t.isTrue("should have been executed", executed);
	}).tearDown(function () {
		rhapsody.undefine(module1Name, module2Name);
	});

});


testRhapsody("async module use 4", function (tester) {
		var user1Values = null,
		user2Values = null,
		user3Values = null,
		module1Name = "m1",
		module2Name = "m2",
		module3Name = "m3",
		module1 = { m: 1},
		module2 = { m: 2},
		module3 = { m: 3};

	tester.addStep(function () {
		rhapsody.use([module1Name, module2Name], function (m1, m2) {
			user1Values = {
				module1: m1,
				module2: m2
			};
		});
		rhapsody.use([module2Name, module3Name], function (m2, m3) {
			user2Values = {
				module2: m2,
				module3: m3
			};
		});
		rhapsody.use([module3Name, module1Name], function (m3, m1) {
			user3Values = {
				module3: m3,
				module1: m1
			};
		});
	}).addStep(function (t) {
		rhapsody.define(module1Name, function () {
			return module1;
		});
	}).addStep(function (t) {
		t.isNull("user1Values should be null", user1Values);
		t.isNull("user2Values should be null", user2Values);
		t.isNull("user3Values should be null", user3Values);
	}).addStep(function (t) {
		rhapsody.define(module2Name, function () {
			return module2;
		});
	}).addStep(function (t) {
		t..isEqual(("user1Values should be ", {
			module1: module1,
			module2: module2
		}, user1Values);
		t.isNull("user2Values should still be null", user2Values);
		t.isNull("user3Values should still be null", user3Values);
	}).addStep(function (t) {
		rhapsody.define(module3Name, function () {
			return module3;
		});
	}).addStep(function (t) {
		t..isEqual(("user2Values should be something else", {
			module2: module2,
			module3: module3
		}, user2Values);
		t..isEqual(("user3Values hsould be something else", {
			module3: module3,
			module1: module1
		}, user3Values);
	}).tearDown(function (t) {
		rhapsody.undefine(module1Name, module2Name, module3Name);
	});

});


testRhapsody("no module name", function (tester) {

	var failed;

	tester.addStep(function (t) {
		failed = t.isFailure(function () {
			rhapsody.define("", function () {});
		}, rhapsody.RhapsodyError);
	}).addStep(function (t) {
		t.isTrue("Expected creating module with empty name to fail",
				failed);
	}).tearDown(function () {
		if (!failed) {
			rhapsody.undefine("");
		}
	});

});

testRhapsody("null module", function (tester) {
	var failed = false;

	tester.addStep(function (t) {
		failed = t.isFailure(function () {
			rhapsody.define("module", null);
		}, rhapsody.RhapsodyError);
	}).addStep(function (t) {
		t.isTrue("Expected creating module with null to fail",
			failed);
	}).tearDown(function () {
		if (!failed) {
			rhapsody.undefine("module");
		}
	});

});

testRhapsody("duplicate name", function (tester) {
	var dupName = "dup",
		failed = false;

	tester.addStep(function () {
		rhapsody.define(dupName, function () {});
	}).addStep(function (t) {
		failed = t.isFailure(function () {
			rhapsody.define(dupName, function () {});
		}, rhapsody.RhapsodyError);
	}).addStep(function (t) {
		t.isTrue("Expected creating dup name to fail", failed);
	}).tearDown(function () {
		rhapsody.undefine("dup");
	});

});

testRhapsody("two users", function (tester) {

	var savedValue1, savedValue2,
		moduleName = "module1";

	tester.addStep(function () {
		rhapsody.define(moduleName, function () {
			return {
				m: function () {
					return true;
				}
			};
		});
	}).addStep(function () {
		rhapsody.use(moduleName, function (m1) {
			savedValue1 = m1.m();
		});
		rhapsody.use(moduleName, function (m1) {
			savedValue2 = m1.m();
		});

	}).addStep(function (t) {
		t.isTrue("expected savedValue1 to be true", savedValue1 === true);
		t.isTrue("expected savedValue2 to be true", savedValue2 === true);
	}).tearDown(function () {
		rhapsody.undefine(moduleName);
	});

});

testRhapsody("is not reinited", function (tester) {
	var inited = 0,
		moduleName = "m1";

	tester.addStep(function () {
		rhapsody.define(moduleName, function () {
			inited++;
			return {};
		});
	}).addStep(function () {
		rhapsody.use(moduleName, function () {});
		rhapsody.use(moduleName, function () {});
		rhapsody.use(moduleName, function () {});
	}).addStep(function (t) {
		t..isEqual((1, inited);
	}).tearDown(function () {
		rhapsody.undefine(moduleName);
	});

});


testRhapsody("chain def", function (tester) {
	var wasExecuted = false,
		moduleName1 = "module1",
		moduleName2 = "module2";

	tester.addStep(function () {
		rhapsody.use([moduleName1], function (m) {
			rhapsody.define(moduleName2, function () {
				return {};
			});
		});
		rhapsody.use([moduleName2], function (m) {
			tester.proceed();
			console.log("I rule");
		});
	}).addStep(function () {
		rhapsody.define(moduleName1, function () {
			return {};
		});
	}).pause(50).tearDown(function () {
		rhapsody.undefine(moduleName1, moduleName2);
	});

});

testRhapsody("moduleUseExt", function (tester) {

	var module1Name = "calle",
		module2Name = "balle";

	tester.addStep(function () {
		rhapsody.define(module1Name, function () {
			return {};
		});
		rhapsody.use([module1Name, module2Name], function () {
			tester.proceed();
		});
		rhapsody.define(module2Name, function () {
			return {};
		});
	}).pause(100).tearDown(function () {
		rhapsody.undefine(module1Name, module2Name);
	});

});

testRhapsody("rhapsodyArrays", function (tester) {

	var arr = [1, 2, 3, 4],
		exp = "1234",
		str = "";
	tester.addStep(function () {
		rhapsody.use(["rhapsody.arrays"], function (Arrays) {
			Arrays.forEach(arr, function (x) {
				str += x;
			});
		});
	}).addStep(function (Asserts) {
		Asserts..isEqual((exp, str);
	}).tearDown(function () {});
});

testRhapsody("define and use", function (tester) {

	var savedMessage;

	tester.addStep(function () {

		rhapsody.define("y", function () {
			return {
				message: "z"
			};
		});

		rhapsody.define("x", function (y) {
			return {
				message: y.message
			};
		}, ["y"]);

		rhapsody.use(["x"], function (x) {
			savedMessage = x.message;
		});

	}).addStep(function (Asserts) {
		Asserts..isEqual(("expected savedMessage === 'z'", "z",
			savedMessage);
	}).tearDown(function () {
		rhapsody.undefine("x", "y");
	});

});
