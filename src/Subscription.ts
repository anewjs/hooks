import { getBatch } from './batch'
import { AnyStore } from './types'

// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

interface ListenerCallback {
  (): any
}

type Listener = null | {
  callback: ListenerCallback
  next: Listener
  prev: Listener
}

interface ListenerCollection {
  notify: () => void
  clear?: () => void
  get?: () => any
  subscribe?: (callback: ListenerCallback) => () => void
}

const nullListeners: ListenerCollection = { notify() {} }

function createListenerCollection(): ListenerCollection {
  const batch = getBatch()
  let first: Listener = null
  let last: Listener = null

  return {
    clear() {
      first = null
      last = null
    },

    notify() {
      batch(() => {
        let listener = first
        while (listener) {
          listener.callback()
          listener = listener.next
        }
      })
    },

    get() {
      let listeners = []
      let listener = first
      while (listener) {
        listeners.push(listener)
        listener = listener.next
      }
      return listeners
    },

    subscribe(callback) {
      let isSubscribed = true

      let listener = (last = {
        callback,
        next: null,
        prev: last,
      })

      if (listener.prev) {
        listener.prev.next = listener
      } else {
        first = listener
      }

      return function unsubscribe() {
        if (!isSubscribed || first === null) return
        isSubscribed = false

        if (listener.next) {
          ;(listener.next as any).prev = listener.prev
        } else {
          last = listener.prev
        }
        if (listener.prev) {
          listener.prev.next = listener.next
        } else {
          first = listener.next
        }
      }
    },
  }
}

export default class Subscription<S extends AnyStore> {
  private unsubscribe: (() => void) | null = null
  private listeners: ListenerCollection = nullListeners
  public onStateChange?: (...args: any) => any

  constructor(private store: S) {}

  notifyNestedSubs() {
    this.listeners.notify()
  }

  handleChangeWrapper = () => {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.store.subscribe(this.handleChangeWrapper)
      this.listeners = createListenerCollection()
    }
  }

  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      if (this.listeners && this.listeners.clear) this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}
