import React, { Component } from 'react'
import { expect } from 'chai'
import { mount } from 'enzyme'

import { Store, connect, Provider } from '../'

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

class MyStore extends Store {
  state = { name: 'foo' }

  setClicked = (name) => this.setState({ clicked: true })

  setName(name) {
    this.setState({ name })
  }
}

describe('<Provider />', () => {
  it('provides the store deeply to connected components', () => {
    const store = new MyStore()

    const el = mount(
      <Provider store={store}>
        <div>
          <ConnectedThing />
        </div>
      </Provider>
    )
    expect(el.text()).to.equal('foo')
    store.setName('bar')
    expect(el.text()).to.equal('bar')
  })
})
