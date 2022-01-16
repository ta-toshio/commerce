import cn from 'classnames'
import React, { FC } from 'react'

interface ContainerProps {
  className?: string
  children?: any // @NOTE ReactNodeではないんだ？
  el?: HTMLElement
  clean?: boolean
}

const Container: FC<ContainerProps> = ({
  children,
  className,
  el = 'div',
  clean,
}) => {
  const rootClassName = cn(className, {
    // （clean:trueでなければ）このcssを当てる枠割のコンポーネント定義
    // 横方向に対して、max-width, 中央揃え、paddingを設定
    'mx-auto max-w-8xl px-6': !clean,
  })

  // @helpful @NOTE elは 'div', 'span' または <div />(HTMLElement)そのもの
  // 大文字から始まなければコンポーネントとして扱えないのでここで入れ替えしていると思われる
  // propsで大文字、小文字が混在しているのは気持ち悪いから内部んで、定義しているのだろうと推測
  let Component: React.ComponentType<React.HTMLAttributes<HTMLDivElement>> =
    el as any

  return <Component className={rootClassName}>{children}</Component>
}

export default Container
