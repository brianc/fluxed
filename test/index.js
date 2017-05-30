import { expect } from 'chai'

import { Store } from '../'

describe('store', () => {
  it('can get and set state', () => {
    const store = new Store()
    expect(store.state).to.eql({})
    store.setState({ foo: 'bar' })
    expect(store.state).to.eql({ foo: 'bar' })
  })

  it('calls subscriptions on change', (done) => {
    const store = new Store()
    expect(store.state).to.eql({ })
    store.subscribe(state => {
      expect(store.subscriptions).to.have.length(1)
      expect(store.state).to.eql({ test: true })
      expect(state).to.eql({ test: true })
      done()
    })
    store.setState({ test: true })
  })

  it('unsubscribes', () => {
    const store = new Store()
    expect(store.subscriptions).to.have.length(0)
    const remove = store.subscribe(() => { throw new Error('failed') })
    expect(store.subscriptions).to.have.length(1)
    remove()
    expect(store.subscriptions).to.have.length(0)
    store.setState({ test: true })
  })

  describe('Subclassed', () => {
    class MyStore extends Store {
      state = { name: 'test' }

      setName(name) {
        this.setState({ name })
      }
    }

    it('allows class initializer for state', () => {
      const store = new MyStore()
      expect(store.state).to.eql({ name: 'test' })
    })

    it('methods on subclass can access state', () => {
      const store = new MyStore()
      store.setName('foo')
      expect(store.state).to.eql({ name: 'foo' })
    })
  })
})
