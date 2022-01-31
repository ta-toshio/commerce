import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import { Grid, Marquee, Hero } from '@components/ui'
// import HomeAllProductsGrid from '@components/common/HomeAllProductsGrid'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
// [
//   {
//     id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc1MzA4NTcwMDUzMDA=',
//     name: 'seiken',
//     vendor: 'nikitiki.app2+02',
//     path: '/seiken',
//     slug: 'seiken',
//     price: { value: 3000, currencyCode: 'JPY' },
//     images: [ [Object] ],
//     variants: [],
//     options: []
//   }
// ]
  const { pages } = await pagesPromise
// [
//   {
//     id: 'Z2lkOi8vc2hvcGlmeS9QYWdlLzk0MTg2OTMwNDIw',
//     url: '/en-US/contact',
//     name: 'Contact'
//   },
//   {
//     id: 'Z2lkOi8vc2hvcGlmeS9QYWdlLzk0MTg2OTMwNDIw',
//     url: '/es/contact',
//     name: 'Contact'
//   }
// ]
  const { categories, brands } = await siteInfoPromise
// categories [
//   {
//     id: 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM5NDE4NTE3OTM4MA==',
//     name: 'Home page',
//     slug: 'frontpage',
//     path: '/frontpage'
//   }
// ]
// brands [
//   {
//     node: {
//       entityId: 'xxxx.app2+02',
//       name: 'xxxx.app2+02',
//       path: 'brands/xxxx.app2+02'
//     }
//   }
// ]

  return {
    props: {
      products,
      categories,
      brands,
      pages,
    },
    revalidate: 60,
  }
}

export default function Home({
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Grid variant="filled">
        {products.slice(0, 3).map((product: any, i: number) => (
          <ProductCard
            key={product.id}
            product={product}
            imgProps={{
              width: i === 0 ? 1080 : 540,
              height: i === 0 ? 1080 : 540,
            }}
          />
        ))}
      </Grid>
      <Marquee variant="secondary">
        {products.slice(0, 3).map((product: any, i: number) => (
          <ProductCard key={product.id} product={product} variant="slim" />
        ))}
      </Marquee>
      <Hero
        headline=" Dessert dragée halvah croissant."
        description="Cupcake ipsum dolor sit amet lemon drops pastry cotton candy. Sweet carrot cake macaroon bonbon croissant fruitcake jujubes macaroon oat cake. Soufflé bonbon caramels jelly beans. Tiramisu sweet roll cheesecake pie carrot cake. "
      />
      <Grid layout="B" variant="filled">
        {products.slice(0, 3).map((product: any, i: number) => (
          <ProductCard
            key={product.id}
            product={product}
            imgProps={{
              width: i === 0 ? 1080 : 540,
              height: i === 0 ? 1080 : 540,
            }}
          />
        ))}
      </Grid>
      <Marquee>
        {products.slice(3).map((product: any, i: number) => (
          <ProductCard key={product.id} product={product} variant="slim" />
        ))}
      </Marquee>
      {/* <HomeAllProductsGrid
        newestProducts={products}
        categories={categories}
        brands={brands}
      /> */}
    </>
  )
}

Home.Layout = Layout
