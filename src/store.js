var bus = require('./bus');

var Store = function(name, config) {
  if (!(this instanceof Store)) {
    return new Store(name, config);
  }

  this.state = {};
  this._teardowns = [];
  this._name = name;

  Object.keys(config).forEach(function(key) {
    if (key == 'on') {
      return;
    }

    if (typeof config[key] == 'function') {
      this.state[key] == null;
      this[key] = function() {
        if (this.state[key]) {
          return this.state[key];
        }
        this.state[key] = config[key].call(this);
        return this.state[key];
      }.bind(this);
    } else {
      this.state[key] = config[key];
      this[key] = function() {
        return this.state[key];
      };
    }
  }.bind(this));

  for (var key in config.on || {}) {
    this._teardowns.push(bus.on(key, config.on[key].bind(this)));
  }
};

Store.prototype.setState = function(newState) {
  for (var key in newState) {
    this.state[key] = newState[key];
  }
  if (this._tid) {
    clearTimeout(this._tid);
  }
  this._tid = setTimeout(function() {
    var topic = this._name + '-store-change';
    bus.emit(topic, { store: this });
  }.bind(this), 1);
};

Store.prototype.destroy = function() {
  this._teardowns.forEach(function(teardown) {
    teardown();
  });
};

module.exports = function(name, config) {
  return new Store(name, config);
};
