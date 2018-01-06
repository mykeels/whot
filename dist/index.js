(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Game = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":2,"inherits":3}],6:[function(require,module,exports){
const Shapes = require('./shapes')
const { GetMove } = require('./moves')

/**
 * Generate a new Card, which may be of any shape and value
 * 
 * @param {Object} props
 * @param {Number} props.value
 * @param {Number} props.shape
 * @param {String} props.move
 * @param {String} props.image (optional)
 */

const Card = function (props = {}) {
    this.value = props.value
    this.shape = props.shape
    this.image = props.image
    this.move = GetMove(props.value)
    this.iNeed = props.iNeed
    
    this.matches = (card = new Card()) => {
        return (card.shape === this.shape) || 
                (card.value === this.value) ||
                (this.shape === Shapes.Whot && this.iNeed && this.iNeed === card.shape) ||
                (card.shape === Shapes.Whot)
    }
    
    this.render = () => `${this.shape} (${this.value})`

    this.reset = () => {
        this.iNeed = null
    }
    
    const self = this;
    Object.assign(this, {
        get score() {
            if (self.shape === Shapes.Star) return self.value * 2
            else return self.value
        }
    })
}

module.exports = Card
module.exports.GetTriangle = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Triangle })))
module.exports.GetCircle = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Circle })))
module.exports.GetSquare = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Square })))
module.exports.GetStar = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Star })))
module.exports.GetWhot = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Whot, value: 20 })))
module.exports.GetCross = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Cross })))
},{"./moves":14,"./shapes":17}],7:[function(require,module,exports){
const Card = require("./card")
const logger = require('./logger')('deck.js')
const EventEmitter = require('events').EventEmitter
const {
    GetCircle,
    GetStar,
    GetSquare,
    GetCross,
    GetTriangle,
    GetWhot
} = require("./card")

const Shapes = require("./shapes")

const circles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]
const triangles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]
const crosses = [1, 2, 3, 5, 7, 10, 11, 13, 14]
const squares = [1, 2, 3, 5, 7, 10, 11, 13, 14]
const stars = [1, 2, 3, 4, 5, 7, 8]
const whots = [20, 20, 20, 20, 20]

/**
 * @param {Object} props
 * @param {EventEmitter} props.emitter
 * 
 * @event deck:create
 * @event deck:shuffle
 */
function Deck(props = {}) {
    if (!props.emitter) {
        logger.warn('props.emitter not defined')
        props.emitter = new EventEmitter()
    }

    this.cards = [].concat(circles.map(value => (GetCircle({ value }))))
                .concat(triangles.map(value => (GetTriangle({ value }))))
                .concat(crosses.map(value => (GetCross({ value }))))
                .concat(squares.map(value => (GetSquare({ value }))))
                .concat(stars.map(value => (GetStar({ value }))))
                .concat(whots.map(value => (GetWhot({ value }))))

    props.emitter.emit('deck:create', this.cards)

    this.shuffle = () => {
        const cards = this.cards.map((card, index) => index).sort((a, b) => Math.random() - 0.5).map(index => this.cards[index])
        props.emitter.emit('deck:shuffle', cards)
        return cards
    }
}

module.exports = Deck
},{"./card":6,"./logger":12,"./shapes":17,"events":1}],8:[function(require,module,exports){
module.exports = (name) => {
    return (message) => {
        const error = new Error(message)
        error.name = name
        return error
    }
}

module.exports.createTypeError = (name) => {
    return (message, type) => {
        const error = new TypeError(message)
        error.type = type
        error.name = name
        return error
    }
}
},{}],9:[function(require,module,exports){
const EventEmitter = require('events').EventEmitter

const Events = new EventEmitter()

module.exports = Events

module.exports.EventEmitter = EventEmitter

module.exports.raiseEvent = (name, ...args) => {
    Events.emit(name, ...args)   
}

module.exports.eventify = (self) => {
    self.events = {}

    self.on = function (event, listener) {
        if (typeof self.events[event] !== 'object') {
            self.events[event] = []
        }

        self.events[event].push(listener)
    }

    self.removeListener = function (event, listener) {
        let idx

        if (typeof self.events[event] === 'object') {
            idx = self.events[event].indexOf(listener)

            if (idx > -1) {
                self.events[event].splice(idx, 1)
            }
        }
    }

    self.emit = function (event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (typeof self.events[event] === 'object') {
            listeners = self.events[event].slice()
            length = listeners.length

            for (i = 0; i < length; i++) {
                listeners[i].apply(self, args)
            }
        }
    }

    self.once = function (event, listener) {
        self.on(event, function g () {
            self.removeListener(event, g)
            listener.apply(self, arguments)
        })
    }
}
},{"events":1}],10:[function(require,module,exports){
const Card = require('./card')
const { GetCircle } = require('./card')
const Deck = require('./deck')
const Market = require('./market')
const Pile = require('./pile')
const Player = require('./player')
const Turn = require('./turn')
const emitter = require('./events')
const createError = require('./errors')
const { createTypeError } = require('./errors')
const logger = require('./logger')('index.js')

const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * @constructor
 * 
 * @param {Object} props
 * @param {Number} props.noOfDecks
 * @param {Number} props.noOfPlayers
 */
const Game = function (props = {}) {
    props.noOfDecks = Number(props.noOfDecks || 1)
    
    if (!Number(props.noOfDecks)) throw InvalidArgumentTypeError('props.noOfDecks')
    if (!Number(props.noOfPlayers)) throw InvalidArgumentTypeError('props.noOfPlayers')

    const pile = new Pile({ emitter })
    
    const market = new Market({ noOfDecks: props.noOfDecks, emitter, pile: () => pile })

    const players = []

    /**
     * create and load players
     */
    for(let i = 1; i <= props.noOfPlayers; i++) {
        const player = new Player({
            id: i,
            emitter,
            market: () => market,
            pile: () => pile
        })
        players.push(player)
    }

    /**
     * create Turn instance to manage player turns
     */
    const turn = new Turn({
        players,
        emitter
    })

    this.turn = turn
    this.market = market
    this.pile = pile
    this.emitter = emitter

    /**
     * distribute 4 cards to each player one by one
     */
    const deal = () => {
        for (let i = 1; i <= 4; i++) {
            players.forEach(player => {
                player.pick()
            })
        }
    }

    const playFirstCard = () => {
        const cards = market.pick(1)
        pile.push(cards)
        return cards[0]
    }
    
    deal() //send 4 cards to each player
    turn.execute(playFirstCard(), true)
}

module.exports = Game
},{"./card":6,"./deck":7,"./errors":8,"./events":9,"./logger":12,"./market":13,"./pile":15,"./player":16,"./turn":18}],11:[function(require,module,exports){
module.exports.Reset = '\x1b[0m'
module.exports.Bright = '\x1b[1m'
module.exports.Dim = '\x1b[2m'
module.exports.Underscore = '\x1b[4m'
module.exports.Blink = '\x1b[5m'
module.exports.Reverse = '\x1b[7m'
module.exports.Hidden = '\x1b[8m'

module.exports.FgBlack = '\x1b[30m'
module.exports.FgRed = '\x1b[31m'
module.exports.FgGreen = '\x1b[32m'
module.exports.FgYellow = '\x1b[33m'
module.exports.FgBlue = '\x1b[34m'
module.exports.FgMagenta = '\x1b[35m'
module.exports.FgCyan = '\x1b[36m'
module.exports.FgWhite = '\x1b[37m'

module.exports.BgBlack = '\x1b[40m'
module.exports.BgRed = '\x1b[41m'
module.exports.BgGreen = '\x1b[42m'
module.exports.BgYellow = '\x1b[43m'
module.exports.BgBlue = '\x1b[44m'
module.exports.BgMagenta = '\x1b[45m'
module.exports.BgCyan = '\x1b[46m'
module.exports.BgWhite = '\x1b[47m'
},{}],12:[function(require,module,exports){
const colors = require('./colors')

module.exports = (name) => {
    return {
        log: (message, ...args) => console.log(`${name}:`, colors.FgCyan, message, ...args, colors.Reset),
        warn: (message, ...args) => console.warn(`${name} (warn):`, colors.FgYellow, message, ...args, colors.Reset),
        error: (message, ...args) => console.error(`${name} (error):`, colors.FgRed, message, ...args, colors.Reset)
    }
}
},{"./colors":11}],13:[function(require,module,exports){
const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('market.js')

const OutOfRangeError = createError('OutOfRangeError')

/**
 * 
 * @param {Object} props
 * @param {Number} props.noOfDecks how many card decks should be in the market?
 * @param {Function} props.pile returns Pile instance
 * @param {EventEmitter} props.emitter
 * 
 * @event market:create
 * @event market:pick
 */
const Market = function (props = {}) {
    props.noOfDecks = props.noOfDecks || 1

    if (!props.emitter) {
        logger.warn('props.emitter not defined')
        props.emitter = new EventEmitter()
    }
    
    /**
     * @type {Card[]}
     */
    let cards = []

    for (let i = 1; i<= props.noOfDecks; i++) {
        const deck = new Deck({ emitter: props.emitter })
        deck.shuffle().forEach(card => cards.push(card))
    }

    props.emitter.emit('market:create', cards.slice(0))

    this.pick = (no = 1) => {
        if (no >= cards.length) {
            if (!props.pile) throw OutOfRangeError('cards')
            else {
                // get more cards from the pile
                props.pile().reset().forEach(card => cards.push(card))
                cards = cards.sort((a, b) => Math.random() - 0.5)
            }
        }
        const pickedCards = cards.splice(0, no)
        props.emitter.emit('market:pick', pickedCards)
        return pickedCards
    }

    this.count = () => cards.length
}

module.exports = Market
},{"../src/card":6,"../src/shapes":17,"./deck":7,"./errors":8,"./logger":12,"events":1}],14:[function(require,module,exports){
/**
 * moved determine the power a card holds
 */

const Moves = {
    PickTwo: 'PickTwo',
    PickThree: 'PickThree',
    GeneralMarket: 'GeneralMarket',
    HoldOn: 'HoldOn',
    Suspension: 'Suspension',
    None: 'None'
}

module.exports = Moves

/**
 * @param {Number} value
 */
const GetMove = (value) => {
    return value === 2 ? Moves.PickTwo :
            (value === 5 ? Moves.PickThree :
            (value === 14 ? Moves.GeneralMarket : 
            (value === 1 ? Moves.HoldOn : 
            (value === 8 ? Moves.Suspension: Moves.None))))
}

module.exports.GetMove = GetMove
},{}],15:[function(require,module,exports){
const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('pile.js')

const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')
const LastCardMismatchError = createError('LastCardMismatchError') //to block attempts to play a card that doesn't match the top card in the pile
const NoCardSuppliedError = createError('NoCardSuppliedError') //to block attempts to play no cards

/**
 * 
 * @param {Object} props 
 * @param {EventEmitter} props.emitter
 * 
 * @event pile:push
 * @event pile:reset
 */
const Pile = function (props = {}) {
    if (!props.emitter) {
        logger.warn('props.emitter not defined')
        props.emitter = new EventEmitter()
    }

    /**
     * @type {Card[]}
     */
    const cards = []

    this.top = () => (cards[cards.length - 1] || null)

    this.push = (_cards_ = []) => {
        if (Array.isArray(_cards_)) {
            if (_cards_.length > 0) {
                const lastCard = _cards_[_cards_.length - 1]
                if (!this.top() || this.top().matches(lastCard)) {
                    this.top() && this.top().reset() //reset card to original config (e.g. set iNeed to null)
                    _cards_.forEach(card => cards.push(card))
                    props.emitter.emit('pile:push', _cards_)
                }
                else {
                    throw LastCardMismatchError({ pile: this.top(), play: lastCard })
                }
            }
            else {
                throw NoCardSuppliedError()
            }
        }
        else {
            throw InvalidArgumentTypeError('_cards_', Array)
        }
    }

    this.reset = () => {
        props.emitter.emit('pile:reset', this.top())
        return cards.splice(0, cards.length - 1)
    }
}

module.exports = Pile
},{"../src/card":6,"../src/shapes":17,"./deck":7,"./errors":8,"./logger":12,"events":1}],16:[function(require,module,exports){
const Shapes = require("./shapes")
const { renderShape } = require('./shapes')
const createError = require('./errors')
const { createTypeError } = require('./errors')
const { eventify } = require('./events')
const EventEmitter = require('events').EventEmitter
const Card = require('./card')
const Pile = require('./pile')
const Market = require('./market')
const Moves = require('./moves')

const util = require('util')
const logger = require('./logger')('player.js')

const CardNotFoundError = createError('CardNotFoundError')
const OutOfTurnError = createError('OutOfTurnError')
const InvalidArgumentError = createError('InvalidArgumentError')
const ExpectedToPickError = createError('ExpectedToPickError')
const PlayValidationFailedError = createError('PlayValidationFailedError')
const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')
const CardNeededUndefinedError = createTypeError('CardNeededUndefinedError')

/**
 * @param {Object} props
 * @param {Number} props.id identifies the player
 * @param {EventEmitter} props.emitter enables event handling and broadcasting
 * @param {function():Boolean} props.validator checks whether or not the player can play the selected card
 * @param {function():Market} props.market returns a Market instance
 * @param {function():Pile} props.pile return a Pile instance
 * 
 * A player participates in a whot game, by holding and playing a card when it's his/her turn
 * 
 * @event player:play when a card is played by being added to the pile
 * @event player:market when the player goes to market
 */
const Player = function (props) {
    if (!props) throw InvalidArgumentError('props')
    if (!props.id) throw InvalidArgumentError('props.id')
    if (!props.emitter) {
        logger.warn('No EventEmitter supplied')
        props.emitter = new EventEmitter()
    }
    if (!props.market || typeof(props.market) !== 'function') throw InvalidArgumentError('props.market')
    if (!props.pile) logger.warn('No Pile Function supplied')
    else if (typeof(props.pile) !== 'function') throw InvalidArgumentError('props.pile must be a function')

    /**
     * 
     * @param {Card} card 
     */
    const validator = (card) => props.pile().top().matches(card)

    /**
     * @type {Card[]}
     */
    const cards = []

    this.id = props.id

    this.turn = false

    this.toPick = 0 //user is expected to pick this number of cards from the market

    /**
     * @param {Card[]} _cards_
     */
    this.add = (_cards_ = []) => {
        if (Array.isArray(_cards_)) {
            _cards_.forEach(card => cards.push(card))
            props.emitter.emit('player:add', _cards_)
            this.emit('add', _cards_)
        }
        else {
            throw InvalidArgumentTypeError('_cards_', Array)
        }
    }

    /**
     * @return {Card[]}
     */
    this.hand = () => cards.slice(0)

    /**
     * @return {Card[]}
     */
    this.pick = () => {
        const marketCards = props.market().pick(this.toPick || 1)
        if (!Array.isArray(marketCards)) throw new InvalidArgumentTypeError('marketCards', Array)
        this.add(marketCards)
        this.emit('market', marketCards)
        props.emitter.emit('player:market', this, marketCards)
        this.toPick = 0
        return marketCards
    }

    /**
     * @param {Number} index position of card in player.hand() to play
     * @param {Number} iNeed shape that Whot card takes for (i need)
     */
    this.play = (index, iNeed) => {
        if (this.turn) {
            const card = cards[index]
            if (card) {
                if (this.toPick === 0 || card.shape === Shapes.Whot) {
                    if (card.shape === Shapes.Whot) {
                        if (!iNeed) throw CardNeededUndefinedError()
                        else card.iNeed = iNeed
                    }
                    if (validator(card)) {
                        cards.splice(index, 1)
                        this.emit('play', card)
                        props.emitter.emit('player:play', this, card)
                        if (props.pile) {
                            props.pile().push([card])
                        }
                        if (this.empty()) {
                            if (props.pile().top().move === Moves.None) {
                                props.emitter.emit('player:checkup', this)
                                this.emit('checkup')
                            }
                            else {
                                this.pick()
                            }
                        }
                        if (this.lastCard()) {
                            props.emitter.emit('player:last-card', this)
                            this.emit('last-card')
                        }
                        return card
                    }
                    else {
                        throw PlayValidationFailedError(JSON.stringify(card))
                    }
                }
                else {
                    throw ExpectedToPickError(this)
                }
            }
            else {
                throw CardNotFoundError(this)
            }
        }
        else {
            throw OutOfTurnError(this)
        }
    }

    this.lastCard = () => (cards.length === 1)

    this.empty = () => (cards.length === 0)

    this.canPlay = () => ((cards.findIndex(card => card.matches(props.pile().top())) >= 0) && (this.toPick === 0))

    this.canMatchMove = (move) => (cards.findIndex(card => card.move === (move || props.pile().top().move)) >= 0)

    this.render = () => `id: ${this.id} count: ${cards.length} hand: [${cards.map(card => card.value + renderShape(card.shape)).join(',')}]`
    
    eventify(this)
}

module.exports = Player
},{"./card":6,"./errors":8,"./events":9,"./logger":12,"./market":13,"./moves":14,"./pile":15,"./shapes":17,"events":1,"util":5}],17:[function(require,module,exports){
/**
 * shapes determine the type of a card
 */

const Shapes = {
    Circle: 'Circle',
    Triangle: 'Triangle',
    Cross: 'Cross',
    Square: 'Square',
    Star: 'Star',
    Whot: 'Whot'
}

module.exports = Shapes

module.exports.renderShape = (shape) => {
    switch (shape) {
        case (Shapes.Circle): return 'c';
        case (Shapes.Cross): return '+';
        case (Shapes.Square): return 's';
        case (Shapes.Star): return '*';
        case (Shapes.Whot): return 'w';
        case (Shapes.Triangle): return 't';
        default: return shape;
    }
}
},{}],18:[function(require,module,exports){
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const Player = require('./player')
const logger = require('./logger')('turn.js')
const Card = require('./card')
const Moves = require('./moves')

const PlayersNotEnoughError = createError('PlayersNotEnoughError')
const InvalidArgumentError = createError('InvalidArgumentError')
const InappropriateMoveError = createError('InappropriateMoveError')
const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * 
 * @param {Object} props
 * @param {Player[]} props.players
 * @param {EventEmitter} props.emitter 
 * 
 * @event turn:switch
 * @event turn:holdon
 * @event turn:pick-two
 * @event turn:pick-three
 * @event turn:suspension
 */
const Turn = function (props = {}) {
    if (!Array.isArray(props.players)) {
        throw InvalidArgumentTypeError('props.players', Array)
    }
    if (!props.emitter) {
        logger.warn('props.emitter not undefined')
        props.emitter = new EventEmitter()
    }

    const players = props.players

    if (players.length === 0) throw PlayersNotEnoughError()
    
    players.forEach((player, index) => {
        player.turn = index === 0
    })

    this.next = () => players.find(player => player.turn)

    /**
     * @param {function():Number} fn
     */
    this.all = (fn) => {
        if (fn && typeof(fn) === 'function') players.forEach(fn)
        return players.length
    }

    /**
     * @param {Number} skip ignore this number of players
     */
    this.switch = (skip = 0) => {
        const nextPlayerIndex = (players.findIndex(player => player.turn) + ++skip) % players.length
        const nextPlayer = players[nextPlayerIndex]
        const currentPlayer = this.next()
        currentPlayer.turn = false
        nextPlayer.turn = true
        props.emitter.emit('turn:switch', skip, nextPlayer)
        return this
    }

    /**
     * @param {Number} noOfPlayers how many players are to pick
     * @param {Number} count how many cards is each player to pick
     * 
     * @returns affected players
     */
    this.setToPick = (noOfPlayers, count, noSwitch) => {
        if (!Number(noOfPlayers)) throw InvalidArgumentError('noOfPlayers')
        if (!Number(count)) throw InvalidArgumentError('count')
        
        let currentPlayerIndex = noSwitch ? -1 : players.findIndex(player => player.turn)
        
        const ret = []
        for (let i = 1; i <= noOfPlayers; i++) {
            let nextPlayerIndex = ((++currentPlayerIndex) % players.length)
            players[nextPlayerIndex].toPick = count
            ret.push(players[nextPlayerIndex])
        }
        return ret
    }

    this.holdon = (noSwitch) => {
        props.emitter.emit('turn:holdon', skipped(this.count() - 1))
        if (!noSwitch) this.switch(this.count() - 1)
    }

    this.pickTwo = (noSwitch) => {
        let nextPlayer = this.next()
        if (nextPlayer.toPick === 0 || nextPlayer.toPick === 2) {
            const affectedPlayers = this.setToPick(1, nextPlayer.toPick + 2, noSwitch)
            if (!noSwitch) nextPlayer.toPick = 0
            props.emitter.emit('turn:pick-two', affectedPlayers[0])
            if (!noSwitch) this.switch()
            return this
        }
        else throw InappropriateMoveError('pickTwo')
    }

    this.pickThree = (noSwitch) => {
        let nextPlayer = this.next()
        if (nextPlayer.toPick === 0 || nextPlayer.toPick === 3) {
            const affectedPlayers = this.setToPick(1, nextPlayer.toPick + 3, noSwitch)
            if (!noSwitch) nextPlayer.toPick = 0
            props.emitter.emit('turn:pick-three', affectedPlayers[0])
            if (!noSwitch) this.switch()
            return this
        }
        else throw InappropriateMoveError('pickThree')
    }

    const skipped = (no) => {
        const ret = []
        let currentPlayerIndex = players.findIndex(player => player.turn)
        for (let i = 1; i <= no; i++) {
            let nextPlayerIndex = ((++currentPlayerIndex) % players.length)
            ret.push(players[nextPlayerIndex])
        }
        return ret
    }

    /**
     * @param {Boolean} isStar check if the card played is a star
     */
    this.suspension = (isStar, noSwitch) => {
        props.emitter.emit('turn:suspension', skipped(isStar ? 2 : 1))
        if (!noSwitch) this.switch(isStar ? 2 : 1)
    }

    this.generalMarket = (noSwitch) => {
        const affectedPlayers = this.setToPick(this.count() - 1, 1, noSwitch)
        props.emitter.emit('turn:general-market', affectedPlayers)
        if (!noSwitch) this.switch()
        return affectedPlayers
    }

    this.count = () => players.length

    /**
     * @param {Card} card
     */
    this.execute = (card, noSwitch) => {
        if (card.move === Moves.GeneralMarket) {
            this.generalMarket(noSwitch)
        }
        else if (card.move === Moves.HoldOn) {
            this.holdon(noSwitch)
        }
        else if (card.move === Moves.PickThree) {
            this.pickThree(noSwitch)
        }
        else if (card.move === Moves.PickTwo) {
            this.pickTwo(noSwitch)
        }
        else if (card.move === Moves.Suspension) {
            this.suspension(noSwitch)
        }
        else {
            if (!noSwitch) this.switch()
        }
    }
}

module.exports = Turn
},{"./card":6,"./errors":8,"./logger":12,"./moves":14,"./player":16,"events":1}]},{},[10])(10)
});