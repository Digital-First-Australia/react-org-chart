const animationDuration = 350
const shouldResize = true

// Nodes
const nodeWidth = 288
const nodeHeight = 75
const nodeSpacing = 15 // padding around outside of each node
const nodePaddingX = 16
const nodePaddingY = 16
const avatarWidth = 48
const nodeBorderRadius = 6
const margin = {
  top: 23,
  right: 23,
  bottom: 23,
  left: 23,
}

// Lines
const lineType = 'angle'
const lineDepthY = nodeHeight + 46 /* Height of the line for child nodes */

// Colors
const backgroundColor = '#fff'
const borderColor = '#fff'
const nameColor = '#201F1E'
const titleColor = '#605E5C'
const reportsColor = '#92A0AD'
const accentColor1 = '#D7E1F4'
const accentColor2 = '#F1F5FB'

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
  accentColor1,
  accentColor2,
  reportsColor,
  shouldResize,
}

module.exports = config
