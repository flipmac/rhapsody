/*jslint nomen: true, plusplus: true, maxlen: 80 */
rhapsody.define("rhapsody.event", function (Compat) {
    "use strict";

    var Ex = rhapsody.RhapsodyError,
        hub = {},
        events = {};

    function isString(o) {
        return typeof o === "string";
    }

    function Event(eventName, eventArgs) {
        this.eventName = eventName;
        this.eventArgs = eventArgs;
        this.listeners = [];
        if (!Compat.isArray(this.eventArgs)) {
            throw new Ex("argDef must be an array");
        }
        if (!Compat.every(this.eventArgs, isString)) {
            throw new Ex("argDef must only contain strings");
        }
    }

    Event.prototype.on = function (callback, scope) {
        this.listeners.push({
            callback: callback,
            scope: scope
        });
    };

    Event.prototype.fire = function (message, responseback) {
        var listenerArgs = Compat.map(this.eventArgs, function (argName) {
            return message[argName];
        }).concat(responseback);

        Compat.forEach(this.listeners, function (listener) {
            listener.callback.apply(listener.scope || window, listenerArgs);
        });
    };

    hub.addEvent = function (eventName, argDef) {
        var evt;

        if (events[eventName] !== undefined) {
            throw new Ex("Event <" + eventName + "> is already defined.");
        }

        evt = new Event(eventName, argDef);
        events[eventName] = evt;
        return evt;
    };

    hub.getEvent = function (eventName) {
        var evt = events[eventName];

        if (evt === undefined) {
            throw new Ex("Event <" + eventName + "> is not defined");
        }
        return evt;
    };

    hub.deleteEvent = function (eventName) {
        delete events[eventName];
    };

    hub.on = function (eventName, callback, scope) {
        hub.getEvent(eventName).on(callback, scope);
    };


    hub.fire = function (eventName, message, responseback) {
        hub.getEvent(eventName).fire(message, responseback);
    };

    return hub;

}, ["rhapsody.compat"]);