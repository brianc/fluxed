var Bus = function() {
  this._handlers = {};
};

Bus.prototype._getHandlers = function(topic) {
  if (!this._handlers[topic]) {
    this._handlers[topic] = [];
  }
  return this._handlers[topic];
};

Bus.prototype.on = function(topic, handler) {
  var handlers = this._getHandlers(topic);
  handlers.push(handler);
  return function() {
    this._handlers[topic] = handlers.filter(function(h) {
      return h != handler;
    });
  }.bind(this);
};

Bus.prototype.emit = function(topic, message) {
  message = message || {};
  this._getHandlers(topic).forEach(function(handler) {
    handler(message);
  });
};

Bus.prototype.mixin = {
  componentWillMount: function() {
    if (!this.on) {
      return;
    }
    var offs = [];
    Object.keys(this.on).forEach(function(key) {
      offs.push(bus.on(key, this.on[key].bind(this)));
    }.bind(this));
    this.on.__off = offs;
  },
  componentWillUnmount: function() {
    if (!this.on) {
      return;
    }
    this.on.__off.forEach(function(off) {
      off();
    });
  }
};

var bus = new Bus();
bus.Bus = Bus;
module.exports = bus;
