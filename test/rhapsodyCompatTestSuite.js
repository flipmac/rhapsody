testRhapsody("test polly bind", function (tester) {
	var oldBind, f;

	tester.addStep(function () {
		if (Function.prototype.bind) {
			oldBind = Function.prototype.bind;
			Function.prototype.bind = null;
		}
		rhapsody.use(["rhapsody.compat"], function (Utils) {
			f = Utils.bind(function () {
				return this.a + 2 + 3;
			}, {a: 1}, 2, 3);
		});
	}).addStep(function (Asserts) {
		Asserts.isEqual("f() === 6", 6, f());
	}).tearDown(function () {
		Function.prototype.bind = oldBind;
	});

});

testRhapsody("test native bind", function (tester) {
	var f;

	tester.addStep(function () {
		rhapsody.use(["rhapsody.compat"], function (Utils) {
			f = Utils.bind(function () {
				return this.a + 2 + 3;
			}, {a: 1}, 2, 3);
		});
	}).addStep(function (Asserts) {
		Asserts.isEqual("f() === 6", 6, f());
	});

});

testRhapsody("test object each", function (tester) {

	var obj = {
		a: 1,
		b: 2,
		c: 3
	}, scope = { x : 7};

	tester.addStep(function (Asserts) {
		rhapsody.use(["rhapsody.compat"], function (Utils) {
			Utils.forEach(obj, function (value, name, obj2) {
				Asserts.isTrue("obj === obj2", obj === obj2);
				Asserts.isTrue("value === obj2[name]", value === obj2[
						name]);
				Asserts.isTrue("this === scope", this === scope);
			}, scope);
		});@
	});
});

testRhapsody("test object each error", function (tester) {

	var obj = {};

	tester.addStep(function (Asserts) {
		rhapsody.use(["rhapsody.compat"], function (Utils) {
			Asserts.isTrue("isFailure: Utils.forEach(obj, obj, obj)", Asserts.
					isFailure(Utils.forEach, [obj, obj, obj], rhapsody.
						RhapsodyError));
			Asserts.isTrue("isFailure: Utils.forEach(1, function, obj)", Asserts.
					isFailure(Utils.forEach, [1, function () {}, obj], rhapsody.
						RhapsodyError));
		});
	});

});

testRhapsody("test native array each", function (tester) {

	var arr = [1, 2, 3],
		scope = {a: 4};

	tester.addStep(function (Asserts) {
		rhapsody.use(["rhapsody.compat"], function (Utils) {
			Utils.forEach(arr, function (value, index, arr2) {
				Asserts.isTrue("arr === arr2", arr === arr2);
				Asserts.isTrue("value === arr2[index]", value === arr2[index]);
				Asserts.isTrue("this === scope", this === scope);
			}, scope);
		});
	});

});

testRhapsody("test polly array each", function (tester) {

	var oldForEach,
		arr = [1, 2, 3],
		scope = {a: 4};

	tester.addStep(function (Asserts) {
		if (Array.prototype.forEach) {
			oldForEach = Array.prototype.forEach;
			Array.prototype.forEach = null;
		}

		rhapsody.use(["rhapsody.compat"], function (Utils) {
			Utils.forEach(arr, function (value, index, arr2) {
				Asserts.isTrue("arr === arr2", arr === arr2);
				Asserts.isTrue("value === arr2[index]", value === arr2[index]);
				Asserts.isTrue("this === scope", this === scope);
			}, scope);
		});
	}).tearDown(function () {
		if (oldForEach) {
			Array.prototype.forEach = oldForEach;
		}
	});

	testRhapsody("test native trim", function (tester) {

		tester.addStep(function (Asserts) {

			rhapsody.use(["rhapsody.compat"], function (compat) {
				Asserts.isTrue('trim(" ").length === 0', compat.trim(" ").
						length === 0);
			});

		});

	});

	testRhapsody("test polly trim", function (tester) {

		var oldTrim;

		tester.addStep(function (Asserts) {
			oldTrim = String.prototype.trim;
			rhapsody.use(["rhapsody.compat"], function (compat) {

				Asserts.isTrue('trim(" ").length === 0', compat.trim(" ").
						length === 0);
			});
		}).tearDown(function () {
			if (oldTrim) {
				String.prototype.trim = oldTrim;
			}
		});

	});


});