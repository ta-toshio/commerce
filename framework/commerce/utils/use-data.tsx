import useSWR, { SWRResponse } from 'swr'
import type {
  HookSWRInput,
  HookFetchInput,
  HookFetcherOptions,
  HookFetcherFn,
  Fetcher,
  SwrOptions,
  SWRHookSchemaBase,
} from './types'
import defineProperty from './define-property'
import { CommerceError } from './errors'

export type ResponseState<Result> = SWRResponse<Result, CommerceError> & {
  isLoading: boolean
}

export type UseData = <H extends SWRHookSchemaBase>(
  options: {
    fetchOptions: HookFetcherOptions
    fetcher: HookFetcherFn<H>
  },
  input: HookFetchInput | HookSWRInput,
  fetcherFn: Fetcher,
  swrOptions?: SwrOptions<H['data'], H['fetcherInput']>
) => ResponseState<H['data']>

const useData: UseData = (options, input, fetcherFn, swrOptions) => {
  const hookInput = Array.isArray(input) ? input : Object.entries(input)
  const fetcher = async (
    url: string,
    query?: string,
    method?: string,
    ...args: any[]
  ) => {
    try {
      // http://localhost:3000/search/frontpage に遷移した時
      // hookInput
      // 0: (2) ['search', ''] -1
      // 1: (2) ['categoryId', undefined]
      // 2: (2) ['brandId', undefined]
      // 3: (2) ['sort', '']
      // 4: (2) ['locale', 'en-US']

      // 0: (2) ['search', ''] - 2
      // 1: (2) ['categoryId', 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM5NDE4NTE3OTM4MA==']
      // 2: (2) ['brandId', undefined]
      // 3: (2) ['sort', '']
      // 4: (2) ['locale', 'en-US']
      //
      // argsの値以下のような値が来ていた
      // ['', undefined, undefined, '', 'en-US'] - 1
      // ['', 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM5NDE4NTE3OTM4MA==', undefined, '', 'en-US'] - 2
      // inputの値
      // {search: '', categoryId: undefined, brandId: undefined, sort: '', locale: 'en-US'} - 1
      // {search: '', categoryId: 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM5NDE4NTE3OTM4MA==', brandId: undefined, sort: '', locale: 'en-US'} - 2
      return await options.fetcher({
        options: { url, query, method },
        // Transform the input array into an object
        input: args.reduce((obj, val, i) => {
          obj[hookInput[i][0]!] = val
          return obj
        }, {}),
        // 実体はframework/commerce/cart/use-cart.tsxで包まれているwrapper
        // 中身にfetcherFnをコールしているのだが実体は
        // framework/shopify/fetcher.ts もしくはframework/commerce/cart/use-cart.tsxのfetcher
        fetch: fetcherFn,
      })
    } catch (error) {
      // SWR will not log errors, but any error that's not an instance
      // of CommerceError is not welcomed by this hook
      if (!(error instanceof CommerceError)) {
        console.error(error)
      }
      throw error
    }
  }
  const response = useSWR(
    () => {
      const opts = options.fetchOptions
      return opts
        ? [opts.url, opts.query, opts.method, ...hookInput.map((e) => e[1])]
        : null
    },
    fetcher,
    swrOptions
  )

  if (!('isLoading' in response)) {
    defineProperty(response, 'isLoading', {
      get() {
        return response.data === undefined
      },
      enumerable: true,
    })
  }

  return response as typeof response & { isLoading: boolean }
}

export default useData
