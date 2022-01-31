// @helpful react.contextの書き方
import {
  ReactNode,
  MutableRefObject,
  createContext,
  useContext,
  useMemo,
  useRef,
} from 'react'

import type {
  Customer,
  Wishlist,
  Cart,
  Product,
  Signup,
  Login,
  Logout,
  Checkout,
} from '@commerce/types'

import type { Fetcher, SWRHook, MutationHook } from './utils/types'

const Commerce = createContext<CommerceContextValue<any> | {}>({})

// サービスのフックAPIを定義
// 各サービスはこれらのAPIを実装する必要がある
// shopifyの実装はframework/shopify/provider.tsにある
export type Provider = CommerceConfig & {
  // httpリクエストメソッドの型定義
  fetcher: Fetcher
  cart?: {
    // @TODO SWRHookの実装内容がよくわらない
    useCart?: SWRHook<Cart.GetCartHook>
    useAddItem?: MutationHook<Cart.AddItemHook>
    useUpdateItem?: MutationHook<Cart.UpdateItemHook>
    useRemoveItem?: MutationHook<Cart.RemoveItemHook>
  }
  checkout?: {
    useCheckout?: SWRHook<Checkout.GetCheckoutHook>
    useSubmitCheckout?: MutationHook<Checkout.SubmitCheckoutHook>
  }
  wishlist?: {
    useWishlist?: SWRHook<Wishlist.GetWishlistHook>
    useAddItem?: MutationHook<Wishlist.AddItemHook>
    useRemoveItem?: MutationHook<Wishlist.RemoveItemHook>
  }
  customer?: {
    useCustomer?: SWRHook<Customer.CustomerHook>
    card?: {
      useCards?: SWRHook<Customer.Card.GetCardsHook>
      useAddItem?: MutationHook<Customer.Card.AddItemHook>
      useUpdateItem?: MutationHook<Customer.Card.UpdateItemHook>
      useRemoveItem?: MutationHook<Customer.Card.RemoveItemHook>
    }
    address?: {
      useAddresses?: SWRHook<Customer.Address.GetAddressesHook>
      useAddItem?: MutationHook<Customer.Address.AddItemHook>
      useUpdateItem?: MutationHook<Customer.Address.UpdateItemHook>
      useRemoveItem?: MutationHook<Customer.Address.RemoveItemHook>
    }
  }
  products?: {
    useSearch?: SWRHook<Product.SearchProductsHook>
  }
  auth?: {
    useSignup?: MutationHook<Signup.SignupHook>
    useLogin?: MutationHook<Login.LoginHook>
    useLogout?: MutationHook<Logout.LogoutHook>
  }
}

// CommerceContextValueで保持する値のユーザーが設定できる項目
export type CommerceConfig = {
  locale: string
  cartCookie: string
}

// <Commerce.Provider value={cfg}>のcfgに入る値の型定義
// providerRef、fetcherRef、locale、cartCookieを格納している。
export type CommerceContextValue<P extends Provider> = {
  providerRef: MutableRefObject<P>
  fetcherRef: MutableRefObject<Fetcher>
} & CommerceConfig

// <Commerce.Providerを使用する際に、メモ化するための関数(CoreCommerceProvider)のpropsの型定義
export type CommerceProps<P extends Provider> = {
  children?: ReactNode
  provider: P
}

/**
 * These are the properties every provider should allow when implementing
 * the core commerce provider
 */
// 実際このコンテキストを使用する(=<CommerceProvider locale={locale}>つまりは<Commerce.Provider)際に渡す
// プロパティの型。childrenと、CommerceConfig(つまりlocaleとcartCookie)をコンテキストの値として保持する
// components/common/Layout/Layout.tsxの例ではlocaleしか渡されていないが。
// @NOTE cartCookieの値はどこかでセットしているのだ？
export type CommerceProviderProps = {
  children?: ReactNode
} & Partial<CommerceConfig>

// useMemoでメモ化するための関数
// provider（実体はframework/shopify/provider.ts）がオブジェクトなので再レンダリングすると
// 新しいオブジェクトとして再生成される？のでレンダリングを抑えるためメモ化をする。
export function CoreCommerceProvider<P extends Provider>({
  provider,
  children,
}: CommerceProps<P>) {
  // @NOTE オブジェクトをuseRefする意図は何だろう
  // 下に説明が書かれていた。Memoするとのこと。
  // memoするためにはuseRefが必要？
  const providerRef = useRef(provider)
  // TODO: Remove the fetcherRef
  const fetcherRef = useRef(provider.fetcher)
  // @helpful レンダリングを抑えるため
  // If the parent re-renders this provider will re-render every
  // consumer unless we memoize the config
  const { locale, cartCookie } = providerRef.current
  const cfg = useMemo(
    () => ({ providerRef, fetcherRef, locale, cartCookie }),
    [locale, cartCookie]
  )

  return <Commerce.Provider value={cfg}>{children}</Commerce.Provider>
}

// Providerは以下の型（インタフェース）を定義
// locale: string、cartCookie: stringや各機能のカスタムフックを提供
export function getCommerceProvider<P extends Provider>(provider: P) {
  return function CommerceProvider({
    children,
    ...props
  }: CommerceProviderProps) {
    return (
      <CoreCommerceProvider provider={{ ...provider, ...props }}>
        {children}
      </CoreCommerceProvider>
    )
  }
}

export function useCommerce<P extends Provider>() {
  return useContext(Commerce) as CommerceContextValue<P>
}
