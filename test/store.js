import { bus, store as build } from '../index';
import expect from 'expect.js';

describe('store builder', function() {
  it('builds a store', function() {
    let store = build('test', {
      name: 'Brian'
    });
    expect(store.name()).to.be('Brian');
    store.destroy();
  });

  it('can pub/sub', function(done) {
    let store = build('test', {
      on: {
        'name-change': function(msg) {
          expect(msg.name).to.be('foo');
          store.destroy();
          done();
        }
      }
    });
    bus.emit('name-change', { name: 'foo' });
  });

  it('can set state', function(done) {
    let store = build('test', {
      name: 'blah'
    });
    store.setState({ name: 'blah2' });
    let off = bus.on('test-store-change', function(msg) {
      expect(msg.store).to.be(store);
      expect(msg.store.name()).to.be('blah2');
      store.destroy();
      off();
      done();
    });
  });

  it('calls pub/sub with store scope', function(done) {
    let store = build('test', {
      name: 'baz',
      on: {
        'name-change': function(msg) {
          expect(this).to.be(store);
          expect(this.state.name).to.be('baz');
          store.destroy();
          done();
        }
      }
    });
    bus.emit('name-change');
  });

  it('allows function properties', function(done) {
    let called = false;
    let store = build('test', {
      name() {
        expect(called).to.be(false);
        called = true;
        setTimeout(_ => {
          this.setState({ name: 'blah' });
        }, 10);
        return 'LOADING';
      }
    });

    expect(store.name()).to.be('LOADING');
    let off = bus.on('test-store-change', function(msg) {
      expect(msg.store).to.be(store);
      expect(msg.store.name()).to.be('blah');
      expect(msg.store.name()).to.be('blah');
      store.destroy();
      off();
      done();
    });
  });

  it('buffers calls to setState', function(done) {
    let store = build('test', {
      name: 'foo'
    });
    let off = bus.on('test-store-change', msg => {
      //set a timeout to make sure we only receive one event
      setTimeout(_ => {
        expect(msg.store.name()).to.be('foo3');
        off();
        store.destroy();
        done();
      }, 10);
    });
    store.setState({name: 'foo1'});
    store.setState({name: 'foo2'});
    store.setState({name: 'foo3'});
  });

  it('round-trips', function(done) {
    let store = build('test', {
      name: 'baz',
      on: {
        'name-change'(msg) {
          let name = msg.name;
          this.setState({ name });
        }
      }
    });
    bus.emit('name-change', { name: 'baz' });
    let off = bus.on('test-store-change', msg => {
      expect(msg.store.name()).to.be('baz');
      off();
      store.destroy();
      done();
    });
  });
});
