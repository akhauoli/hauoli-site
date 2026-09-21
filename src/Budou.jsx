import { Children, cloneElement, isValidElement } from 'react'
import { Parser } from 'budoux/parser'
import { model as jaModel } from 'budoux/model-ja'

// 日本語の文節単位でしか折り返さないためのラッパー。
// BudouX が判定した文節の切れ目にゼロ幅スペース(U+200B)を入れ、
// CSS(.budou) の keep-all で「文節の途中」での改行を禁止する。
// <br /> などの子要素はそのまま残るので、意図的な改行はこれまで通り書ける。
const parser = new Parser(jaModel)
const SEP = '\u200b'

function segment(node) {
  if (typeof node === 'string') return parser.parse(node).join(SEP)
  if (Array.isArray(node)) return Children.map(node, segment)
  if (isValidElement(node) && node.props.children != null) {
    return cloneElement(node, undefined, segment(node.props.children))
  }
  return node
}

export default function Budou({ as: Tag = 'span', className = '', children, ...rest }) {
  return (
    <Tag className={`budou ${className}`.trim()} {...rest}>
      {segment(children)}
    </Tag>
  )
}
