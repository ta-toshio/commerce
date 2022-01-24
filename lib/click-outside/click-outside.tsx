// @helpful 要素外をクリックしたらイベント発火
import React, { useRef, useEffect, MouseEvent } from 'react'
import hasParent from './has-parent'

interface ClickOutsideProps {
  active: boolean
  onClick: (e?: MouseEvent) => void
  children: any
}

const ClickOutside = ({
  active = true,
  onClick,
  children,
}: ClickOutsideProps) => {
  const innerRef = useRef()

  const handleClick = (event: any) => {
    // ポップアップメニュー要素外をクリックしたら"onClick(event)"が走る
    // onClick(event)はactiveをfalseにする処理が渡ってきている
    if (!hasParent(event.target, innerRef?.current)) {
      if (typeof onClick === 'function') {
        // （でも要素内をクリックしてもactiveをfalseにしているので、この分岐意味あるのか？と思ってる）
        onClick(event)
      }
    }
  }

  useEffect(() => {
    if (active) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }

    return () => {
      if (active) {
        document.removeEventListener('mousedown', handleClick)
        document.removeEventListener('touchstart', handleClick)
      }
    }
    // 依存がない場合はレンダリング毎にuseEffectの中が実行するのだと思われる
  })

  return React.cloneElement(children, { ref: innerRef })
}

export default ClickOutside
