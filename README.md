rhapsody
========

This is a "loosely coupled module dependency" framework. The idea is that you can create a module by doing:

```javascript

rhapsody.define("moduleName", function () {
    return {
        someMethod: function () {
           //  ... do something
        }
    };
});
```


and then you can use the module as:

```javascript
rhapsody.use("moduleName", function(m) {
  m.someMethod();
});
```

Testing
---

It also contains a testing framework called rhapsody test. You can run the tests by opening /test/[some]TestSuite.html in a browser.



