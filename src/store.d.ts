// TODO: Remove file and use @types/anew-store instead
declare module '@anew/store' {
  export declare type Args<T extends (first: any, ...args: any) => any> = T extends (
    first: any,
    ...args: infer P
  ) => any
    ? P
    : never
  /**
   * -----------------------
   * Store
   * -----------------------
   */
  export interface BaseState {
    [stateKey: string]: any
  }
  export interface BaseReducers<State> {
    [reducerName: string]: (state: State, ...args: any) => Readonly<Partial<State>> | void
  }
  export interface BaseGetters<State> {
    [getterName: string]: (state: State, ...args: any) => any
  }
  export interface BaseActions {
    [actioName: string]: (...args: any) => any
  }
  export default class Store<
    State extends BaseState,
    Reducers extends BaseReducers<State>,
    Getters extends BaseGetters<State>,
    Actions extends BaseActions
  > {
    private isGroup
    private isStateChange
    private _collection?
    private _collectionKey?
    private _state
    private _initialState
    private _reducers?
    private _actions?
    private _getters?
    private _subscriptions
    private _nextSubscriptions
    actions: Actions
    reducers: {
      [RKey in keyof Reducers]: (...args: Args<Reducers[RKey]>) => ReturnType<Reducers[RKey]>
    }
    getters: {
      [GKey in keyof Getters]: (...args: Args<Getters[GKey]>) => ReturnType<Getters[GKey]>
    }
    constructor(config: { state: State; reducers?: Reducers; getters?: Getters; actions?: Actions })
    private setCollection
    private initReducers
    private initActions
    private initGetters
    private notifyCollection
    private notifiySubscriptions
    private ensureCanMutateNextListeners
    subscribe: (
      listener: ({
        reducer,
        action,
        args,
        stateChange,
      }: {
        reducer?: keyof Reducers | undefined
        action?: keyof Actions | undefined
        args: Array<any>
        stateChange: Readonly<Partial<State>>
      }) => any
    ) => () => void
    setState(state: Partial<State>, reducerName?: string, args?: any[]): void
    resetState(): void
    get state(): Readonly<State>
    get initialState(): Readonly<State>
    get collection(): Readonly<StoreCollection<any>>
    group(): void
    groupEnd(actionKey?: string, args?: any[]): void
  }
  /**
   * -----------------------
   * Store Collection
   * -----------------------
   */
  export interface BaseStores {
    [storeName: string]: Store<any, any, any, any> | StoreCollection<BaseStores>
  }
  export declare class StoreCollection<Stores extends BaseStores> {
    private stores
    private isGroup
    private isGroupEnding
    private _collection?
    private _collectionKey?
    private _state
    private _initialState
    actions: { [STKey in keyof Stores]: Stores[STKey]['actions'] }
    reducers: { [STKey in keyof Stores]: Stores[STKey]['reducers'] }
    getters: { [STKey in keyof Stores]: Stores[STKey]['getters'] }
    constructor(stores: Stores)
    private setCollection
    private onChildrenStateUpdate
    private notifyCollection
    subscribe(
      listener: ({
        storeName,
        reducer,
        action,
        args,
        stateChange,
      }: {
        storeName: keyof Stores
        reducer?: string | number | symbol
        action?: string | number | symbol
        args: Array<any>
        stateChange: Readonly<BaseState>
      }) => any
    ): () => void[]
    setState(
      state: Partial<
        {
          [STKey in keyof Stores]: Partial<Stores[STKey]['state']>
        }
      >,
      reducerName?: string,
      args?: any[]
    ): void
    resetState(): void
    get state(): Readonly<
      {
        [STKey in keyof Stores]: Stores[STKey]['state']
      }
    >
    get initialState(): Readonly<
      {
        [STKey in keyof Stores]: Stores[STKey]['initialState']
      }
    >
    get collection(): Readonly<StoreCollection<any>>
    getStore<ST extends keyof Stores>(storeName: ST): Stores[ST]
    group(): void
    groupEnd(): void
  }
  /**
   * -----------------------
   * Store Prop Creators
   * -----------------------
   */
  export declare function createStore<State extends BaseState>(
    state: State
  ): Store<State, BaseReducers<State>, BaseGetters<State>, BaseActions>
  export declare function createStoreCreator<
    S extends Store<any, any, any, any> | StoreCollection<any>
  >(
    store: S
  ): {
    createActionWithStore: <A extends (store: S, ...args: any) => any>(
      action: A,
      actionName?: string
    ) => (...args: Args<A>) => ReturnType<A>
    createAction: <A_1 extends (...args: any) => any>(
      action: A_1,
      actionName?: string
    ) => (...args: Parameters<A_1>) => ReturnType<A_1>
    createReducer: <
      R extends (state: S['state'], ...args: any) => void | Parameters<S['setState']>[0]
    >(
      reducer: R,
      reducerName?: string
    ) => (...args: Args<R>) => ReturnType<R>
    createGetter: <G extends (state: S['state'], ...args: any) => any>(
      getter: G
    ) => (...args: Args<G>) => ReturnType<G>
  }
  export declare function createActionWithStore<
    S extends Store<any, any, any, any> | StoreCollection<any>
  >(
    store: S
  ): <A extends (store: S, ...args: any) => any>(
    action: A,
    actionName?: string
  ) => (...args: Args<A>) => ReturnType<A>
  export declare function createAction<S extends Store<any, any, any, any> | StoreCollection<any>>(
    store: S
  ): <A extends (...args: any) => any>(
    action: A,
    actionName?: string
  ) => (...args: Parameters<A>) => ReturnType<A>
  export declare function createReducer<S extends Store<any, any, any, any> | StoreCollection<any>>(
    store: S
  ): <R extends (state: S['state'], ...args: any) => Parameters<S['setState']>[0] | void>(
    reducer: R,
    reducerName?: string
  ) => (...args: Args<R>) => ReturnType<R>
  export declare function createGetter<S extends Store<any, any, any, any> | StoreCollection<any>>(
    store: S
  ): <G extends (state: S['state'], ...args: any) => any>(
    getter: G
  ) => (...args: Args<G>) => ReturnType<G>
}
