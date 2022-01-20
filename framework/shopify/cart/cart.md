# useCartまわり

shopifyサービスの利用

## 概要

* framework/shopify/index.tsx
  * エントリポイント

* framework/shopify/provider.ts
  * 各APIの実体や設定パラメータを集める。エントリポイントにわたす

* framework/commerce/index.tsx
  * CommerceContextValueの実装
  * providerで定義している各APIの実体や設定パラメータの型情報の定義や、コンテキストvalueとして提供している。

## 詳細

### エントリポイント

framework/shopify/index.tsx
```jsx
// プロバイダー定義
// ここのプロバイダーとは以下のAPIを定義
// {
// locale: 'en-us', // デフォルトロケール
// cartCookie: SHOPIFY_CHECKOUT_ID_COOKIE, // カート中身をcookieにでも格納するのか
// fetcher, // 後ほど記載、shopify共通fetch関数
// cart: { useCart, useAddItem, useUpdateItem, useRemoveItem }, // カートAPI
// customer: { useCustomer }, // カスタマーAPI
// products: { useSearch }, // 商品API
// auth: { useLogin, useLogout, useSignup }, // 認証API
// }
export { shopifyProvider }
export type { ShopifyProvider }
export const CommerceProvider = getCommerceProvider(shopifyProvider)
export const useCommerce = () => useCoreCommerce<ShopifyProvider>()
```

### カートまわり
#### 1. useCart - handlerまわり
framework/shopify/cart/use-cart.tsx

handlerはどこで使用されているか
-> 

cartに関するクエリを発行するための役割（のはず）

```jsx
// この行がエントリポイント
export default useCommerceCart as UseCart<typeof handler>
  
// shopify固有の処理を実装
// fetchOptions, fetcher, useHookを定義
export const handler: SWRHook<GetCartHook> = {
  fetchOptions: {
    // クエリを定義
    query: getCheckoutQuery,
  },
  // shopify固有に関するクエリを実行する前後にはさみたい処理を記述
  // 引数に渡されているfetchがshopify共通fetch関数
  // @see framework/shopify/fetcher.ts
  async fetcher({ input: { cartId }, options, fetch }) {
...    
  // useData内部でuseSWRを実行
  // useSWRをwrapしている。レスポンス内容メモ化とisEmptyというメソッドを生やしている。
  useHook:
    ({ useData }) =>
      (input) => {
        const response = useData({
          swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
        })
        return useMemo(
```


#### fetcherまわり
framework/shopify/fetcher.ts

実際Httpリクエストするファイル

* ヘッダーをセット
  * 'X-Shopify-Storefront-Access-Token': API_TOKEN!,
  * 'Accept-Language': locale,
* エラーがあればthrowする


#### useCartまわり
framework/commerce/cart/use-cart.tsx
```jsx
const useCart: UseCart = (input) => {
  // 
  const hook = useHook(fn)
...
  return useSWRHook({ ...hook, fetcher: wrapper })(input)
```

#### useHook,useSWRHookまわり

framework/commerce/utils/use-hook.ts 

CommerceContextValueに格納したproviderRefの中身を取得するヘルパー関数郡。
コンテクストValueとして格納しているのでuseContextで取得するためにuseXXXのフックを使っている。

useFetcher()はproviderRefのfetcherを。
useHook((provider: P) => H)はproviderRefに格納されているものを(provider: P) => Hで取得
  例、const fn = (provider: Provider) => provider.cart?.useCart!
useSWRHookはuseFetcher()からfetcherを取得して、hook.useHook()(1で定義されてたuseHook)とuseData(後述)に処理を委譲。
useMutationHookはまだ調査していない @TODO
```jsx
export function useFetcher() {
  const { providerRef, fetcherRef } = useCommerce()
  return providerRef.current.fetcher ?? fetcherRef.current
}

export function useHook<
  P extends Provider,
  H extends MutationHook<any> | SWRHook<any>
>(fn: (provider: P) => H) {
  const { providerRef } = useCommerce<P>()
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
```

#### useDataまわり

framework/commerce/utils/use-data.tsx

useSWRが肝の処理。
fetcherでは3箇所で定義されているfetcherを考慮。
* framework/shopify/cart/use-cart.tsx - handler.fetcher
* framework/commerce/cart/use-cart.tsx - fetcher
* framework/shopify/fetcher.ts - fetcher, providerとして格納されている

```jsx
const useData: UseData = (options, input, fetcherFn, swrOptions) => {
  const fetcher = async (
...
  ) => {
      // こちらはframework/shopify/cart/use-cart.tsxのfetcher
      return await options.fetcher({
...
        // 実体はframework/commerce/cart/use-cart.tsxで包まれているwrapper
        // 中身にfetcherFnをコールしているのだが実体は
        // framework/shopify/fetcher.ts もしくはframework/commerce/cart/use-cart.tsxのfetcher
        fetch: fetcherFn,
      })
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
  return response as typeof response & { isLoading: boolean }
```



### カートまわりまとめ

framework/shopify/cart/use-cart.tsx
framework/shopify/fetcher.ts
