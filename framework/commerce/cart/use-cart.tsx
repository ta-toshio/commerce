import Cookies from 'js-cookie'
import { useHook, useSWRHook } from '../utils/use-hook'
import type { SWRHook, HookFetcherFn } from '../utils/types'
import type { GetCartHook } from '../types/cart'
import { Provider, useCommerce } from '..'

export type UseCart<
  H extends SWRHook<GetCartHook<any>> = SWRHook<GetCartHook>
> = ReturnType<H['useHook']>

export const fetcher: HookFetcherFn<GetCartHook> = async ({
  options,
  input: { cartId },
  fetch,
}) => {
  return cartId ? await fetch(options) : null
}

const fn = (provider: Provider) => provider.cart?.useCart!

const useCart: UseCart = (input) => {
  // hook には fn = (provider: Provider) => provider.cart?.useCart!のuseCartが返ってくる
  // useCartの実体は framework/shopify/cart/use-cart.tsx のhandler
  // @see framework/shopify/provider.ts -> import { handler as useCart } from './cart/use-cart'
  // @see framework/shopify/cart/use-cart.tsx -> export default useCommerceCart as UseCart<typeof handler>
  const hook = useHook(fn)
  // CommerceContextValue のcartCookieを取得
  // @see framework/commerce/index.tsx
  const { cartCookie } = useCommerce()
  // @see framework/shopify/cart/use-cart.tsx の handler.fetcher
  const fetcherFn = hook.fetcher ?? fetcher
  // context.input.cartIdに cookieからcartCookieに指定されたキーを使ってcardIdを取得
  const wrapper: typeof fetcher = (context) => {
    context.input.cartId = Cookies.get(cartCookie)
    return fetcherFn(context)
  }
  // @see framework/commerce/utils/use-hook.ts
  return useSWRHook({ ...hook, fetcher: wrapper })(input)
}

export default useCart
