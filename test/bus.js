import expect from 'expect.js';
import { bus } from '../index';

var Bus = bus.Bus;

describe('bus', function() {
  it('exists', function() {
    expect(bus).to.be.a(Bus);
  });

  it('can pub-sub', function(done) {
    var count = 0;
    var off = bus.on('boom', function() {
      count++;
      if (count == 2) {
        off();
        done();
      }
    });

    bus.emit('boom');
    bus.emit('boom');
    bus.emit('boom');
  });

  it('can pub-sub with or without a message', function(done) {
    var off = bus.on('blah', function(msg) {
      expect(msg).to.be.a('object');
      if (msg.done) {
        off();
        done();
      }
    });
    bus.emit('blah');
    bus.emit('blah', { done: true });
  });
});
