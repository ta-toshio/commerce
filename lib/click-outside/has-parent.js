import isInDOM from './is-in-dom'

export default function hasParent(element, root) {
  // root && root.contains(element) は element(=クリックtarget要素)が
  // root(=ポップアップメニュー要素)の中に含まれているかどうかをチェック
  // なのでポップアップメニュー要素内をクリックすればfalseになる
  // isInDOM(element)は Boolean(element.closest('body'))
  // falseになる動作が分からなかった(serverサイドはfalseになるが)
  return root && root.contains(element) && isInDOM(element)
}
