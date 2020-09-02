const defaultConfig = {
  borderRadius: 4,
}

module.exports = function defineAvatarClip(svg, id, config = {}) {
  config = {
    ...defaultConfig,
    ...config,
  }

  const defs = svg.append('svg:defs')

  defs
    .append('clipPath')
    .attr('id', id)
    .append('circle')
    .attr('cx', 37)
    .attr('cy', 37)
    .attr('r', 24)
}
