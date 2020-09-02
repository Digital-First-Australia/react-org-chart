const animationDuration = 350
const shouldResize = true

// Nodes
const nodeWidth = 288
const nodeHeight = 71
const nodeSpacing = 12
const nodePaddingX = 16
const nodePaddingY = 16
const avatarWidth = 48
const nodeBorderRadius = 6
const margin = {
  top: 13,
  right: 13,
  bottom: 13,
  left: 13,
}

// Lines
const lineType = 'angle'
const lineDepthY = 120 /* Height of the line for child nodes */

// Colors
const backgroundColor = '#fff'
const borderColor = '#fff'
const nameColor = '#201F1E'
const titleColor = '#605E5C'
const reportsColor = '#92A0AD'

const config = {
  margin,
  animationDuration,
  nodeWidth,
  nodeHeight,
  nodeSpacing,
  nodePaddingX,
  nodePaddingY,
  nodeBorderRadius,
  avatarWidth,
  lineType,
  lineDepthY,
  backgroundColor,
  borderColor,
  nameColor,
  titleColor,
  reportsColor,
  shouldResize,
}

module.exports = config
