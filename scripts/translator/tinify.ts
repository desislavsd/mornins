import { enhanceFetchPromise } from './utils'

const API_KEY = process.env.TINIFY_API_KEY
const BASE_URL = `https://api.tinify.com/shrink`

export async function optimizeImage(data: ArrayBuffer) {
  const result: TinifyResponse = await api(BASE_URL, {
    body: data,
  }).json()

  const img = await api(result.output.url, {
    body: {
      convert: { type: 'image/webp' },
    },
  }).arrayBuffer()

  return img
}

function api(
  url: RequestInfo,
  options: Omit<RequestInit, 'body'> & { body?: BodyInit | object } = {}
): ReturnType<typeof enhanceFetchPromise> {
  let { body } = options

  const json = isJSON(body)

  const method = body ? 'POST' : 'GET'

  const headers: Record<string, string> = {
    Authorization: 'Basic ' + btoa(`api:${API_KEY}`),
    ...(options?.headers as Record<string, string>),
  }

  if (json) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  const promise = fetch(url, {
    method,
    ...options,
    headers,
    body: <any>body,
  })

  return enhanceFetchPromise(promise)
}

type TinifyResponse = {
  input: {
    size: number
    type: string
  }
  output: {
    size: number
    type: string
    width: number
    height: number
    ratio: number
    url: string
  }
}

function isJSON(object: any) {
  if (typeof object !== 'object') return false
  if (object instanceof Buffer) return false
  if (object instanceof ArrayBuffer) return false
  return true
}
