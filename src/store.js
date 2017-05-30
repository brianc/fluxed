export default class Store {
  constructor(initialState = {}) {
    this.state = initialState
    this.subscriptions = []
  }

  subscribe(subscription) {
    this.subscriptions = this.subscriptions.concat([subscription])
    return () => this.subscriptions = this.subscriptions.filter(sub => sub !== subscription)
  }

  setState(newState) {
    this.state = Object.assign({}, this.state, newState)
    this.subscriptions.forEach(sub => sub(this.state))
  }
}


