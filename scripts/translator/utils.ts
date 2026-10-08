export function enhanceFetchPromise(promise: Promise<Response>) {
  const methods = <const>['json', 'arrayBuffer', 'text', 'blob']

  promise = promise.then((response) => {
    if (response.ok) return response
    throw new Error(response.statusText, { cause: response })
  })

  const handlers = methods.map((name) => [
    name,
    async (...args: Parameters<Response[typeof name]>) => {
      const response = await promise
      return response[name](...args)
    },
  ])

  const extension = Object.fromEntries(handlers) as Pick<
    Response,
    (typeof methods)[number]
  >

  return Object.assign(promise, extension)
}

export function forceAsyncChain<T extends (...args: any[]) => Promise<any>>(
  f: T,
  delay = 1000,
): T {
  let q: Promise<any> = Promise.resolve()

  return ((...args: any[]) => {
    const promise = q.then(() => f(...args))

    q = Promise.allSettled([promise, new Promise((r) => setTimeout(r, delay))])

    return promise
  }) as T
}
