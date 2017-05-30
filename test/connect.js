import React, { Component } from 'react'
import { expect } from 'chai'
import { mount } from 'enzyme'

import { Store, connect } from '../'


class Thing extends Component {
  static myStatic = () => true

  render() {
    const { setName, setClicked, name } = this.props

    const onClick = () => {
      setName('clicked')
      setClicked()
    }

    return <div onClick={onClick}>{name}</div>
  }
}

const ConnectedThing = connect()(Thing)

describe('connect', () => {
  it('hoists statics', () => {
    expect(Thing.myStatic()).to.equal(true)
    expect(ConnectedThing.myStatic()).to.equal(true)
  })

  it('throws if mouted without a store', () => {
    expect(() => { mount(<ConnectedThing />) }).to.throw()
  })

  it('can mount with a provided store via props', () => {
    const store = new Store({ name: 'foo' })
    const el = mount(<ConnectedThing store={store} />)
    expect(el.text()).to.equal('foo')
  })

  it('re-renders component when store changes', () => {
    const store = new Store({ name: 'foo' })
    const el = mount(<ConnectedThing store={store} />)
    expect(el.text()).to.equal('foo')
    store.setState({ name: 'bar' })
    expect(el.text()).to.equal('bar')
  })

  it('disconnects from store after component is unmounted', () => {
    const store = new Store({ name: 'foo' })
    const el = mount(<ConnectedThing store={store} />)
    expect(el.text()).to.equal('foo')
    el.unmount()
    store.setState({ name: 'bar' })
    expect(store.subscriptions).to.have.length(0)
  })

  it('merges in actions from the store to the component', () => {
    class MyStore extends Store {
      state = { name: 'foo' }

      setClicked = (name) => this.setState({ clicked: true })

      setName(name) {
        this.setState({ name })
      }
    }

    const store = new MyStore()
    const el = mount(<ConnectedThing store={store} />)
    el.simulate('click', { })
    expect(el.text()).to.equal('clicked')
    expect(store.state.clicked).to.equal(true)
  })
})
