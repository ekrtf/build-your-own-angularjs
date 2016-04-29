'use strict';

var _ = require('lodash');

/**
 *
 * Exports
 */

module.exports = Scope;

/**
 *
 * Constructor
 */

function Scope() {
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
}

/**
 *
 * Public functions
 */

Scope.prototype.$watch = function(watchFn, listenerFn) {
    this.$$watchers.push({
        watchFn: watchFn,
        listenerFn: listenerFn || function() {},
        last: initLastValue
    });
};

Scope.prototype.$digest = function() {
    var ttl = 10;
    var dirty = null;

    this.$$lastDirtyWatch = null;

    do {
        dirty = this._digestOnce();
        if (dirty && !(ttl--)) {
            throw '10 $digest iterations reached';
        }
    } while (dirty);
};

Scope.prototype._digestOnce = function() {
    var self = this;
    var newValue, oldValue, dirty;

    _.forEach(self.$$watchers, function(watcher) {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;

        if (newValue !== oldValue) {
            var old = oldValue === initLastValue ? newValue : oldValue;

            self.$$lastDirtyWatch = watcher;

            watcher.last = newValue;
            watcher.listenerFn(newValue, old, self);

            dirty = true;
        }
        else if (self.$$lastDirtyWatch === watcher) {
            return false;
        }
    });

    return dirty;
};

/**
 *
 * Private functions
 */

function initLastValue() {

}
