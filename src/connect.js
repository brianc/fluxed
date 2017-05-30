import React, { Component } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics';
import PropTypes from './prop-types'

const connect = () => ChildComponent => {

  class ConnectedComponent extends Component {
    static contextTypes = {
      store: PropTypes.store,
    }

    componentWillMount() {
      const store = this.props.store || (this.context || 0).store

      if (!store) {
        throw new Error('Store is missing - please use a <Provider store={store} /> or pass directly as a prop to this component')
      }

      const actions = { }

      Object
        // this gets prototype methods off the subclass of a store
        .getOwnPropertyNames(store.constructor.prototype)
        // this gets any late bound methods such as setName = (name) => this.setState({ name })
        .concat(Object.getOwnPropertyNames(store))
        // remove the constructor itself & any non-method properties
        .filter(x => x != 'constructor' && typeof store[x] == 'function')
        .forEach(key => actions[key] = store[key].bind(store))

      this.state = { ...store.state, ...actions }
      this.componentWillUnmount = store.subscribe((state) => this.setState(state))
    }

    render() {
      const childProps = {
        ...this.state,
        ...this.props,
      }
      return React.createElement(ChildComponent, childProps, this.props.children)
    }
  }

  hoistNonReactStatic(ConnectedComponent, ChildComponent)

  return ConnectedComponent
}

export default connect
