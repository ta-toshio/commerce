// @helpful 表示要素にフォーカスを当てる
// 使用箇所 components/ui/Modal/Modal.tsx
import React, { useEffect, RefObject } from 'react'
import { tabbable } from 'tabbable'

interface Props {
  children: React.ReactNode | any
  focusFirst?: boolean
}

export default function FocusTrap({ children, focusFirst = false }: Props) {
  const root: RefObject<any> = React.useRef()
  // document.activeElementとは？
  const anchor: RefObject<any> = React.useRef(document.activeElement)

  const returnFocus = () => {
    // Returns focus to the last focused element prior to trap.
    if (anchor) {
      anchor.current.focus()
    }
  }

  const trapFocus = () => {
    // Focus the container element
    if (root.current) {
      // モーダルビュー要素にフォーカス
      root.current.focus()
      if (focusFirst) {
        // モーダルビュー内最初の要素にフォーカス
        selectFirstFocusableEl()
      }
    }
  }

  const selectFirstFocusableEl = () => {
    // Try to find focusable elements, if match then focus
    // Up to 6 seconds of load time threshold
    let match = false
    let end = 60 // Try to find match at least n times
    let i = 0
    const timer = setInterval(() => {
      // よく分からない条件だな・・・。
      // やりたいことはフォーカスしたら分岐に入らないではないのか。
      if (!match !== i > end) {
        // @see https://github.com/focus-trap/tabbable
        // Small utility that returns an array of all* tabbable DOM nodes within a containing node.
        match = !!tabbable(root.current).length
        if (match) {
          // Attempt to focus the first el
          tabbable(root.current)[0].focus()
        }
        i = i + 1
      } else {
        // Clear interval after n attempts
        clearInterval(timer)
      }
    }, 100)
  }

  useEffect(() => {
    setTimeout(trapFocus, 20)
    return () => {
      returnFocus()
    }
  }, [root, children])

  return React.createElement(
    'div',
    {
      ref: root,
      className: 'outline-none focus-trap',
      tabIndex: -1,
    },
    children
  )
}
