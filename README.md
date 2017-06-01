# fluxed

A very small flux implementation with the same React bindings as react-redux.

## Example

The first thing we need to manage our state is a store.  In fluxed a `Store` is a base class you should subclass.  This subclass is where you put the shared global state for your application.  Example:

```js
import { Store } from 'fluxed'

export default class MyStore extends Store {
  state = { 
    userLoggedIn: false,
    isLoggingIn: false,
  }

  async login(username, password) {
    this.setState({ isLoggingIn: true })
    try {
      const response = await fetch('/login', { method: 'POST' })
      if (response.ok) {
        cosnt body = await response.json()
        this.setState({ userLoggedIn: true })
      }
    } finally {
      this.setState({ isLogginIn: false })
    }
  }
}
```

There. No action creators, constants, reducers, thunks, selectors, etc. Just a single class that you can call `setState` on to set new state.  

That's really all you _need_ for flux. To manually hook this store up to a component it would look something like this contrived example:

```js
import React, { Component } from 'react'
import MyStore from './store'

const store = new MyStore()

class Login extends Component {
  state = {
    username: '',
    password: ''
  }

  componentWillMount() {
    // attach our component to the store - whenever the store's state changes
    // we will update our component's local state to be equal to the store's state
    // also we will automatically unsubscribe from the store when this component unmounts
    this.componentWillUnmount = store.subscribe((state) => this.setState(state))
  }

  onSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const { username, password } = this.state
    store.login(username, password)
      .catch(e => alert('login failed!'))
  }

  render() {
    const { isLoggingIn, username, login } = this.state
    if (isLoggingIn) {
      return <div>Logging in, please wait...</div>
    }
    if (userLoggedIn) {
      return <div>Welcome user!</div>
    }
    return (
      <form onSubmit={this.onSubmit}>
        <input placeholder='Username' value={username} onChange={e => this.setState({ username: e.target.value })} />
        <input placeholder='Password' value={password} onChange={e => this.setState({ password: e.target.value })} />
        <input type='submit'>Log in!</input>
      </form>
    )
  }
}
```

That's it!

### But wait...

One thing that's not nice about the example above is the `Login` component is coupled directly to an instance of the store. We lose out on a lot of compsability and reusability because everywhere the `Login` component goes it takes with it its own instance of `MyStore`.  

We _could_ instantiate `MyStore` in a different file and require that file & it's single instance in the `Login` component.  That way we could share the single store instance with other components in our app; however, each component would still be referencing the store directly both when subscribing/unsubscribing to the store, and when calling actions on the store.

### Provider & connect

If you're familiar with react-redux we've copied the concepts of its "dependency injection" here.  We can "connect" our components to a store instance "provided" to the component hierarchy.  It looks like this:

```js
import React, { Component } from 'react'
import { Provider, connect, Store } from 'fluxed'

class NameStore extends Store {
  state = { 
    isNameValid: true,
    name: 'foo',
  }

  setName(name) {
    // don't allow blank names!
    const isNameValide = name && name.length
    this.setState({ name, isNameValid })
  }
}

const store = new NameStore()

// this is our main 'app' component
class App extends Component {
  render() {
    // we 'provide' the store instance to sub-components
    return (
      <Provider store={store}>
        <div>
          <NavBar />
          <Content />
          <Footer />
        </div>
      </Provider>
    )
  }
}

@connect
class NavBar extends Component {
  render() {
    // notice the state of the store is now avaialbe as props.
    // our NavBar component has no idea the props come from the store and not
    // directly set by a parent component
    const { name, isNameValid } = this.props
    const text = isNameValid ? `Hello ${name}!` : `Please enter a name`
    return <div>{text}</div>
  }
}

@connect
class Content extends Component {
  render() {
    // Notice all the methods on the store instance
    // are passed in as props to this component as well.
    // The component doesn't know or care if it came from a parent component directly
    // or from a connected store
    const { name, setName } = this.props
    return (
      <div>
        <p>Please enter your name:</p>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
    )
  }
}

const Footer = connect()((props) => {
  return (
    <div>You can connect functional components as well, {props.name || 'whoever you are'}!</div>
  )
})

```

The `<Provider />` and `connect` methods intentionally mirror the `react-redux` method signatures.  This is to make it easy to migrate to `redux` if/when you want to.  I think `fluxed` is a great way to get started & teach the concepts of flux without also having to give a long talk on functional programming concepts and introduce a lot of ceremony.

## API

### Store

`Store` is a class. It is intended to be subclassed much like `React.Component` is subclassed.

`store.setState(newState: object) => void`

Used to update the state of the store.  All subscription callbacks will be synchronously called with the new state immediately after the state is updated.

Keys are shallowly merged with existing store state similar to how `react.setState` works. Unlike react's `setState` this method is not async and does not batch calls.

`store.subscribe(callback: (state: object) => void) => (unsubscribe: () => void)`

Subscribes a callback to the store which will be called with the new store state every time the store state changes.  Returns a function you can call to remove this subscription from the store.

`store.state: object`

The current state of the store.  You should avoid accessing this externally, but can be useful in store methods to check the existing state & computing new state from it.

### connect() => ((component: ReactComponent) => connectedComponent: ReactComponent)

Connect is a function that takes no arguments.  It returns a function which takes an a React `component` and returns a higher-order React `connectedComponent` which "connects" instances of the `component` to the store automatically.  The store's state and the store's methods will both be passed into the `component` instance as `props`.  Locally supplied props to the `component` will take precedence over any comming from the connected store.

_note: react-redux has `mapStateToProps` and `mapDispatchToProps` as arguemnts to its `connect()` function.  Fluxed doesn't have that at this time.

### <Provider />

`<Provider />` is a higher-order component which has a required `store` property.  Internally provider sets the supplied `store` on the [context](https://facebook.github.io/react/docs/context.html) allowing any component created via `connect` to access the store given to the `<Provider />` regardless of where the connected components live within the component hierarchy.

This mirrors react-redux 1:1 AFAIK.

# License

Copyright (c) 2017 ShipStation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.