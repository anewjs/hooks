interface Batch {
  <c extends (...args: any) => any>(callback: c): void
}

// Default to a dummy "batch" implementation that just runs the callback
const defaultNoopBatch: Batch = callback => {
  callback()
}

let batch = defaultNoopBatch

// Allow injecting another batching function later
export const setBatch = (newBatch: Batch) => (batch = newBatch)

// Supply a getter just to skip dealing with ESM bindings
export const getBatch = () => batch
