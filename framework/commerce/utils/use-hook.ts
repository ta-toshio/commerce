import { useCallback } from 'react'
import { Provider, useCommerce } from '..'
import type { MutationHook, PickRequired, SWRHook } from './types'
import useData from './use-data'

export function useFetcher() {
  const { providerRef, fetcherRef } = useCommerce()
  // type Fetcher<T = any, B = any> = (options: FetcherOptions<B>) => T | Promise<T>
  // @see framework/commerce/utils/types.ts
  // @see framework/shopify/fetcher.ts - const fetcher: Fetcher = async ... を返却
  return providerRef.current.fetcher ?? fetcherRef.current
}

export function useHook<
  P extends Provider,
  H extends MutationHook<any> | SWRHook<any>
>(fn: (provider: P) => H) {
  // @see framework/commerce/index.tsx
  // CommerceContextValueのproviderRef, fetcherRef, locale, cartCookieの値を保持
  // ここではproviderRefを使用
  const { providerRef } = useCommerce<P>()
  // providerは@see framework/shopify/provider.ts、型はframework/commerce/index.tsx
  const provider = providerRef.current
  return fn(provider)
}

export function useSWRHook<H extends SWRHook<any>>(
  hook: PickRequired<H, 'fetcher'>
) {
  const fetcher = useFetcher()

  return hook.useHook({
    useData(ctx) {
      const response = useData(hook, ctx?.input ?? [], fetcher, ctx?.swrOptions)
      return response
    },
  })
}

export function useMutationHook<H extends MutationHook<any>>(
  hook: PickRequired<H, 'fetcher'>
) {
  const fetcher = useFetcher()

  return hook.useHook({
    fetch: useCallback(
      ({ input } = {}) => {
        return hook.fetcher({
          input,
          options: hook.fetchOptions,
          fetch: fetcher,
        })
      },
      [fetcher, hook.fetchOptions]
    ),
  })
}
