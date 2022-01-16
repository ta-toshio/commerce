import { useMemo } from 'react'
import useCommerceCart, { UseCart } from '@commerce/cart/use-cart'

import { SWRHook } from '@commerce/utils/types'
import { checkoutToCart } from '../utils'
import getCheckoutQuery from '../utils/queries/get-checkout-query'
import { GetCartHook } from '../types/cart'
import Cookies from 'js-cookie'

import {
  SHOPIFY_CHECKOUT_ID_COOKIE,
  SHOPIFY_CHECKOUT_URL_COOKIE,
} from '../const'

export default useCommerceCart as UseCart<typeof handler>

export const handler: SWRHook<GetCartHook> = {
  fetchOptions: {
    query: getCheckoutQuery,
  },
  async fetcher({ input: { cartId }, options, fetch }) {
    if (cartId) {
      // このfetchは framework/shopify/fetcher.ts のfetch
      // つまりこのfetcher関数はfetchをwrapするための関数
      // checkout?.completedAt 完了だったらカートの中身を削除して、完了してなかったら...
      const { node: checkout } = await fetch({
        ...options,
        variables: {
          checkoutId: cartId,
        },
      })
      if (checkout?.completedAt) {
        Cookies.remove(SHOPIFY_CHECKOUT_ID_COOKIE)
        Cookies.remove(SHOPIFY_CHECKOUT_URL_COOKIE)
        return null
      } else {
        // checkoutオブジェクトを(おそらく)cart用に整形している
        // @see framework/shopify/utils/normalize.ts
        return checkoutToCart({
          checkout,
        })
      }
    }
    return null
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })
      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.lineItems.length ?? 0) <= 0
              },
              enumerable: true,
            },
          }),
        [response]
      )
    },
}
