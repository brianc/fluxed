import React, { Component } from 'react'
import PropTypes from './prop-types'

export default class Provider extends Component {
  static propTypes = {
    store: PropTypes.store,
  }

  static childContextTypes = {
    store: PropTypes.store,
  }

  getChildContext() {
    return { store: this.props.store }
  }

  render() {
    return this.props.children
  }
}
