import { useDebugValue, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'

import shallowEqual from './shallowEqual'
import Subscription from './Subscription'
import { AnyStore } from './types'

interface Selector<ST extends AnyStore> {
  (state: ST['state']): any
}

interface Equality<S extends AnyStore['state'] = AnyStore['state']> {
  <State extends S>(a: State, b: State): boolean
}

const refEquality: Equality = (a, b) => a === b

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect

function useStoreStateWithStoreAndSubscription<
  ST extends AnyStore,
  S extends Selector<ST>,
  E extends Equality<ST['state']>
>(store: ST, selector: S, equalityFn: E): ReturnType<S> {
  const [, forceRender] = useReducer(s => s + 1, 0)
  const subscription = useMemo(() => new Subscription(store), [store])

  const latestSubscriptionCallbackError = useRef<Error>()
  const latestSelector = useRef<S>()
  const latestStoreState = useRef<ST['state']>()
  const latestSelectedState = useRef<any>()

  const storeState = store.state
  let selectedState: any

  try {
    if (
      selector !== latestSelector.current ||
      storeState !== latestStoreState.current ||
      latestSubscriptionCallbackError.current
    ) {
      selectedState = selector(storeState)
    } else {
      selectedState = latestSelectedState.current
    }
  } catch (err) {
    if (latestSubscriptionCallbackError.current) {
      err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\n`
    }

    throw err
  }

  useIsomorphicLayoutEffect(() => {
    latestSelector.current = selector
    latestStoreState.current = storeState
    latestSelectedState.current = selectedState
    latestSubscriptionCallbackError.current = undefined
  })

  useIsomorphicLayoutEffect(() => {
    function checkForUpdates() {
      try {
        const newSelectedState = (latestSelector as any).current(store.state)

        if (equalityFn(newSelectedState, latestSelectedState.current)) {
          return
        }

        latestSelectedState.current = newSelectedState
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        latestSubscriptionCallbackError.current = err
      }

      forceRender()
    }

    subscription.onStateChange = checkForUpdates
    subscription.trySubscribe()

    checkForUpdates()

    return () => subscription.tryUnsubscribe()
  }, [store, subscription])

  return selectedState
}

/**
 * Hook factory, which creates a `useStoreState` hook bound to a given store.
 *
 * @param {Store} [store] Store
 * @returns {Function} A `useStoreState` hook bound to the specified store.
 */
export default function createUseStoreState<ST extends AnyStore>(store: ST) {
  function useStoreState<S extends Selector<ST>, E extends Equality<ST['state']>>(
    selector: S,
    equalityFn: E = refEquality as E
  ) {
    if (process.env.NODE_ENV !== 'production' && !selector) {
      throw new Error(`You must pass a selector to useStoreState`)
    }

    const selectedState = useStoreStateWithStoreAndSubscription(store, selector, equalityFn)

    useDebugValue(selectedState)

    return selectedState
  }

  useStoreState.withSallowEqual = function useStoreStateWithShallowEqual<S extends Selector<ST>>(
    selector: S
  ) {
    return useStoreState(selector, shallowEqual)
  }

  return useStoreState
}
