# @anew/hooks

> AnewJS hooks for react application

## Updates

For updates checkout [Change Log](https://github.com/anewjs/hooks/blob/master/CHANGELOG.md).

## Installation

To install `@anew/hooks` directly into your project run:

```
npm i @anew/hooks -S
```

for yarn users, run:

```
yarn add @anew/hooks
```

## Usage

```js
import {createStore} from '@anew/store'
import {createUseStoreState} from '@anew/hooks'


// Example Store
const CounterStore = createStore({ count: 1 })

// Create Hook to use counter state
const useCounterState = createUseStoreState(CounterStore)

// Usage
const Counter = () => {
    const count = useCounterState(state => state.count)

    // ⚠️ NOTE: Use shallowEqal when returning an object
    // Otherwise the a re-render will be triggered on any
    // state change since the a new object is instanitated every time
    const {count} = useStoreState.withSallowEqual(state => ({ count: state.count }))

    return <div>{count}<div>
}
```
