if (typeof testRhapsody === "undefined") {

	var testRhapsody = (function (win, doc) {
		"use strict";

		var printer, asserts, addTest;

		printer = (function (win, doc) {

			var config = {
					CLASS_TEST_NAME: "testName",
					CLASS_FAILURE: "failure",
					CLASS_SUCCESS: "success",
					CLASS_UNEXPECTED: "unexpected",
					CLASS_STACKTRACE: "stacktrace",
					ID_RESULT_CONTAINER: "simpleJsResult",
					ID_TABLE: "simpleJsResultTable"
				},
				isInit = false,
				inputs = [];

			function escapeHtml(str) {
				return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').
    					replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			}

			function escapeStacktrace(str) {
				return escapeHtml(str).
    					replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").
    					replace(/ /g, "&nbsp;").
    					replace(/\n/g, "<br />");
			}

			function print() {
				var isSuccess, input, resultContainer, resultElement, table,
					rowClassName;

				isInit = true;

				if (inputs.length === 0) {
					return;
				}

				resultContainer = doc.getElementById(config.
						ID_RESULT_CONTAINER);

				if (!resultContainer) {
					table = doc.createElement("table");
					table.id = config.ID_TABLE;
					table.innerHTML = 
						"<thead>" + 
							"<th>Test Name</th><th>Status</th>" +
							"<th>Message</th><th>Stacktrace</th>" +
						"</thead>" + 
						"<tbody id=\"" + config.ID_RESULT_CONTAINER + "\">" +
						"</tbody>";
					doc.body.appendChild(table);
					resultContainer = doc.getElementById(config.
							ID_RESULT_CONTAINER);
				}

				while (input = inputs.shift() /* assignment */) {
					isSuccess = input.status === "Success";
					resultElement = doc.createElement("tr");

					if (isSuccess) {
						rowClassName = config.CLASS_SUCCESS;
					} else {
						rowClassName = config.CLASS_FAILURE;

						if (input.status === "Unexpected Error") {
							rowClassName += " " + config.CLASS_UNEXPECTED;
						}
					}

					resultElement.className = rowClassName;
					
					resultElement.innerHTML = 
						"<td>" + input.testName + "</td>" +
						"<td>" + input.status + "</td>" + 
						"<td>" + (isSuccess ? "N/A" : escapeHtml(input.
									message)) 
								+ "</td>" +
						"<td class=\"" + config.CLASS_STACKTRACE + "\">" +
							 	(isSuccess ? "N/A" : 
								escapeStacktrace(input.stack)) + "</td>";
					resultContainer.appendChild(resultElement);
				}
			};

			function showResult(result) {
				inputs.push(result);
				if (isInit) {
					print();
				}
			}

			(function () {
				var oldOnLoad = window.onload;
				if (typeof oldOnLoad === "function") {
					win.onload = function () {
						print();
						oldOnLoad();
					};
				} else {
					win.onload = print;
				}
			}());

			return {
				
				showFailure: function (testName, message, stacktrace, 
						unexpected) {
					var failure = {
						testName: testName,
						message: message,
						stack: stacktrace,
					};

					if (unexpected) {
						failure.status = "Failure";			
					} else {
						failure.status = "Unexpected Error";
					}
					showResult(failure);
				},

				showSuccess: function (testName) {
					showResult({
						testName: testName,
						status: "Success"
					});
				}
			};

		}(window, document));


		function AssertionFailedError(message) {
			this.message = message;
		}

		AssertionFailedError.prototype = new Error();


		asserts = (function (Ex) {

			function stringify(obj) {
				if (typeof JSON === "function") {
					return JSON.stringify(obj);
				}
				return "" + obj;
			}

			function equals(a, b) {
				var n;
				if (a === b) {
					return true;
				}
				if (typeof a === "undefined" || typeof b === "undefined" ||
					typeof a === "string" || typeof b === "string" ||
					typeof a === "number" || typeof b === "number" ||
					typeof a === "boolean" || typeof b === "boolean" ||
					a === null || b === null) {
					return false;
				}
				if (a.constructor.toString() !== b.constructor.toString()) {
					return false;
				}
				for (n in a) {
					if (!equals(a[n], b[n])) {
						return false;
					}
				}
				return true;
			}

			function assert() {
				var condition, message;
			
				if (arguments.length === 0) {
					throw new Error("No argument: use assert(condition) or " + 
						"assert(message, condition)");
				}

				if (arguments.length === 2) {
					message = arguments[0];
					if (typeof message !== "string") {
						throw new Error("Illegal arguments : " + arguments);
					}
					condition = arguments[1];
				} else {
					message = "assertion failed";
					condition = arguments[0];
				}
				
				if (!condition) {
					throw new Ex(message);
				}
			}

			function isFailure() {
				var fun, args, errorType,
					failed = false;

				if (arguments.length === 3) {
					args = arguments[1];
					errorType = arguments[2];
				} else if (arguments.length === 2) {
					errorType = arguments[1];
				} else {	
					throw new Error("isFailure: Wrong number of arguments");
				}
				fun = arguments[0];

				if (typeof errorType !== "function" ||
					typeof fun !== "function") {
					throw new TypeError("wrong argument types (fun=" + 
						typeof fun + ", errorType=" + typeof errorType + ")");
				}

				if (typeof args !== "undefined" && 
					typeof args.length === "undefined") {
					throw new TypeError("wrong argument type: args must be " +
							"an array.");
				}
				args = args || [];

				try {
					fun.apply(win, args);
				} catch (expected) {
					assert("failed with wrong error type\n expected <" +
							errorType + "> but was <" + expected + ">", 
							expected instanceof errorType);
					failed = true;
				}

				return failed;
			}

			function assertNull() {
				var message, obj;

				if (arguments.length === 0) {
					throw new Error("No argument: use assertNull(obj) or" + 
						" assert(message, obj)");
				}
				if (arguments.length === 2) {
					message = arguments[0];
					if (typeof message !== "string") {
						throw new Error("Illegal arguments: " + arguments);
					}
					obj = arguments[1];
				} else {
					obj = arguments[0];
					message = "expected null but was <" + stringify(obj) + ">";
				}
				assert(message, obj === null);
			}

			function assertEquals() {
				var actual, expected, message;

				if (arguments.length === 0) {
					throw new Error("No argument: use assertEquals(expected, " + 
						" actual) or assert(message, expected, actual)");
				}

				if (arguments.length === 3) {
					message = arguments[0];
					if (typeof message !== "string") {
						throw new Error("Illegal arguments : " + arguments);
					}
					actual = arguments[2];
					expected = arguments[1];
				} else {
					message = "";
					actual = arguments[1];
					expected = arguments[0];
				}

				message = message + "\nexpected equality: expected <" + 
					stringify(expected) + ">, actual: <" + stringify(actual) + ">";
				assert(message, equals(actual, expected));
			}

			return {
				assert: assert,
				assertEquals: assertEquals,
				assertNull: assertNull,
				isFailure: isFailure
			};

		}(AssertionFailedError));
		
		addTest = (function (asserts, printer, Ex) {

			var running = false, 
				tests = [];
			
			function fail (testName, error) {
				printer.showFailure(testName, error.message, error.stack,
					error instanceof Ex);
			}
			
			function success (testName) {
				printer.showSuccess(testName);
			}

			function Test (testName) {
				this._workList = [];
				this._testName = testName;
				this._timeout = null;
				this._finished = false;
				this._pauseScheduled = false;
			}

			Test.prototype._tearDown = function () {
				this._finished = true;
			};

			Test.prototype._makeWork = function (stage, step, timeout) {
				return {
					stage: stage,
					func: step,
					timeout: timeout || null
				};
			};

			Test.prototype._pushWork = function (stage, step, timeout) {
				this._workList.push(this._makeWork(stage, step, timeout));
				return this;
			};

			Test.prototype._run = function () {
				var work, 
					that = this,
					savedError = null;

				function next() {
					if (that._workList.length === 0) {
						
						if (savedError) {
							fail(that._testName, savedError);
						} else {
							success(that._testName);
						}
						if (tests.length !== 0) {
							tests.shift()._run();
						}
					} else {

						try {
							work = that._workList.shift();

							if (work.timeout !== null) {
								/* 
								 * add an autofail method to the work list,
								 * if proceed is called we remove that, and 
								 * continue emediately.
								*/
								(function (timeout) {

									that._workList.unshift(that.
										_makeWork("autofail", function () {
											throw new Ex("Timeout " + timeout +
											 		"[ms].");
										})
									);
								}(work.timeout));

								that._timeout = setTimeout(next, work.timeout);
								that._pauseScheduled = false;
								/* 
								 * end loop, will be continueed when 
								 * either the timeout ends or the user
								 * calls proceed.
								 */
								return;
							}

							work.func.call(window, asserts);
						} catch (error) {
							
							if (savedError === null) {
								savedError = error;
							}
							
							if (work.stage !== "tearDown" && 
								typeof that._tearDown === "function") {
								that._workList = [that.
										_makeWork("tearDown", that._tearDown)];
							} else {
								that._workList = [];
							}

						}

						setTimeout(next, 0);
					}

				}
				setTimeout(next, 0);
			}

			Test.prototype.addStep = function (step) {
				return this._pushWork(null, step);
			};

			Test.prototype.tearDown = function (func) {
				var oldTearDown,
					that = this;

				oldTearDown = this._tearDown;
				this._tearDown = function () {
					try {
						func();
					} finally {
						oldTearDown.call(that);
					}
				};
				this._pushWork("tearDown", this._tearDown);
			};

			Test.prototype.pause = function (timeout) {
				this._pushWork(null, null, timeout);
				this._pauseScheduled = true;
				return this;
			};

			Test.prototype.proceed = function () {
				if (!this._finished) {
					// autofail scheduled
					if (this._timeout !== null) {
						clearTimeout(this._timeout);
						this._timeout = null;
						this._run();
						// remove autofail
						this._workList.shift();
					} else if (this._pauseScheduled) {
						// remove pause
						this._workList.shift();
					}
					
				}
			};

			function run (test) {
				if (running) {
					tests.push(test);
				} else {
					test._run();
					running = true;
				}
			}

			return function addTest(testName, testDef) {
				var test = new Test(testName, this, asserts);
				try {
					testDef(test);
					run(test);
				} catch (error) {
					printer.showFailure(testName, error.message, error.stack,
							false);
				}
			};

		}(asserts, printer, AssertionFailedError));

		return addTest;

	}(window, document));

}