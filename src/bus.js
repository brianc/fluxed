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

var bus = new Bus();
bus.Bus = Bus;
export default bus;
