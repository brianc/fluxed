import bus from './bus';

//store constructor
//requires the name of the store and a config
//containing the initial store state
var Store = function(name, config) {
  this.state = {};
  this._teardowns = [];
  this._name = name;

  Object.keys(config).forEach(function(key) {
    if (key == 'on') {
      return;
    }

    //set up state value provider
    //provides state values lazily as the result of a function call
    //you can do async state easily like...
    //{
    //  name: function() {
    //    var self = this;
    //    setTimeout(function() {
    //      self.setState({ name: 'loaded!!' });
    //    }, 1000)
    //    return 'loading...';
    //  }
    //}
    if (typeof config[key] == 'function') {
      //initialize state to null
      this.state[key] == null;

      this[key] = function() {
        //if state is not null return the cached value
        if (this.state[key]) {
          return this.state[key];
        }
        //call the accessor 
        this.state[key] = config[key].call(this);
        return this.state[key];
      }.bind(this);
    } else {
      //if the value is not a function
      //then just bound it as a simple value
      this.state[key] = config[key];
      this[key] = function() {
        return this.state[key];
      };
    }
  }.bind(this));

  //bind "on" properties as events to the bus
  //bind the functions in the scope of the store:
  //
  //example:
  //{
  //  name: 'Uninitialized',
  //  on: {
  //    'new-name': function(msg) {
  //      this.setState({ name: msg.name });
  //    }
  //  }
  //}
  //
  //this would set the store's state 'name' key to the value 'initialized'
  //  bus.emit('new-name', { name: 'Initialized' });
  //
  for (var key in config.on || {}) {
    this._teardowns.push(bus.on(key, config.on[key].bind(this)));
  }
};

//set the state of a value in the store
//batches state applications
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

//Remove the store from the bus
//You probably wont call this much in practice
//since most stores live as singletons but 
//definitely helpful for unit testing
Store.prototype.destroy = function() {
  this._teardowns.forEach(function(teardown) {
    teardown();
  });
};

export default function(name, config) {
  return new Store(name, config);
};
