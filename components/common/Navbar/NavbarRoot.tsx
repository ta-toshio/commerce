import { FC, useState, useEffect } from 'react'
import throttle from 'lodash.throttle'
import cn from 'classnames'
import s from './Navbar.module.css'

/**
 * スクロールされていれば css class: 'shadow-magical'を付与する。
 */
const NavbarRoot: FC = ({ children }) => {
  // 画面トップにいるか、スクロールされているか
  // スクロールされればhasScrolled:true。trueになった後、トップに戻ったらfalseに戻る。
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    // @helpful
    const handleScroll = throttle(() => {
      const offset = 0
      // Document.documentElement は、その document のルート要素
      // (例えば、 HTML 文書の場合は <html> 要素) である Element を返します。
      // scrollTopはスクロール量
      const { scrollTop } = document.documentElement
      // 1pxでもスクロールされていればscrolledはtrue
      const scrolled = scrollTop > offset


      if (hasScrolled !== scrolled) {
        setHasScrolled(scrolled)
      }
    }, 200)

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [hasScrolled])

  return (
    <div className={cn(s.root, { 'shadow-magical': hasScrolled })}>
      {children}
    </div>
  )
}

export default NavbarRoot
