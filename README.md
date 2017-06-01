# fluxed

A very small flux implementation with the same react bindings as react-redux.

## API

### Store

Store is a base class you should sublcass yourself.  This is where you put the shared global state for your application.  Example:

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

No action creators, constants, reducers, thunks, selectors, etc. Just a single class that you can call `setState` on to set new state.  

That's really all you _need_ for flux. To hook this store up to a component it would look something like this contrived example:

```js
import React, { Component } from 'react
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

#### But wait...

One thing that's not nice about the example above is the `Login` component is coupled directly to an instance of the store. We lose out on a lot of compsability and reusability because everywhere the `Login` component goes it takes with it its own instance of `MyStore`.  We could instantiate `MyStore` in a different file and require that file & it's single instance in the `Login` component so we could share the single store instance with other components, but each component would still be referencing the store directly both when subscribing/unsubscribing to the store, and when calling actions on the store.

### <Provider /> & connect

If you're familiar with react-redux we've copied the concepts of its "dependency injection" here.  We can 'connect' our instance to a store "provided" to the component hierarchy up above.  It would look like so:

```js
import React, { Component } from 'react'
import { Provider, connect, Store } from 'fluxed'

class MyStore extends Store {
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

// this is our main 'app' component
class App extends Component {
  render() {
    const store = new MyStore()
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
    // notice the state of the store is now avaialbe as props
    // this NavBar component has no idea the props come from the store and not
    // directly set by a parent component
    const { name, isNameValid } = this.props
    const text = isNameValid ? `Hello ${name}!` : `Please enter a name`
    return <div>{text}</div>
  }
}

@connect
class Content extends Component {
  render() {
    // notice all the methods on the store instance
    // are passed in as props to this component
    // the component doesn't know if it care from a parent component directly
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
    <div>You can connect functional components as well</div>
  )
})

```

The `<Provider />` and `connect` methods intentionally mirror the `react-redux` method signatures.  This is to make it easy to migrate to `react-redux` if/when you want to.  I think `fluxed` is a great way to get started & teach the concepts of flux without also having to give a long talk on functional programming concepts and introduce a lot of ceremony.


# License

MIT