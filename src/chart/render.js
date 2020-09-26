const d3 = require('d3')
const { wrapText, helpers, covertImageToBase64 } = require('../utils')
const renderLines = require('./renderLines')
const exportOrgChartImage = require('./exportOrgChartImage')
const exportOrgChartPdf = require('./exportOrgChartPdf')
const onClick = require('./onClick')
const onParentClick = require('./onParentClick')
const iconLink = require('./components/iconLink')
const supervisorIcon = require('./components/supervisorIcon')
const CHART_NODE_CLASS = 'org-chart-node'
const PERSON_LINK_CLASS = 'org-chart-person-link'
const PERSON_NAME_CLASS = 'org-chart-person-name'
const PERSON_TITLE_CLASS = 'org-chart-person-title'
const PERSON_HIGHLIGHT = 'org-chart-person-highlight'
const PERSON_REPORTS_CLASS = 'org-chart-person-reports'


function render(config) {
  const {
    svgroot,
    svg,
    tree,
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    backgroundColor,
    nameColor,
    titleColor,
    reportsColor,
    borderColor,
    avatarWidth,
    lineDepthY,
    treeData,
    sourceNode,
    onPersonLinkClick,
    loadImage,
    downloadImageId,
    downloadPdfId,
    elemWidth,
    margin,
    onConfigChange,
  } = config

  // Compute the new tree layout.
  const nodes = tree.nodes(treeData).reverse()
  const links = tree.links(nodes)

  config.links = links
  config.nodes = nodes

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * lineDepthY
  })

  // Update the nodes
  const node = svg.selectAll('g.' + CHART_NODE_CLASS).data(
    nodes.filter(d => d.id),
    d => d.id
  )

  const parentNode = sourceNode || treeData

  svg.selectAll('#supervisorIcon').remove()

  supervisorIcon({
    svg: svg,
    config,
    treeData,
    x: 70,
    y: -24,
  })

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .insert('g')
    .attr('class', CHART_NODE_CLASS)
    .attr('transform', `translate(${parentNode.x0}, ${parentNode.y0})`)

  // Person's Coin Background Card's Shadow
  nodeEnter
    .append('rect')
    .attr('id', d => `coin-shadow-${d.id}`)
    .attr('class', d => (!helpers.getTextForTitle(d) ? 'remove' : 'box coin'))
    .attr('x', nodeWidth / 2 - 16)
    .attr('y', nodeHeight - 2)
    .attr('width', 32)
    .attr('height', 32)
    .attr('fill', backgroundColor)
    .attr('rx', 16)
    .attr('ry', 16)
    .attr('fill-opacity', 0.13)
    .attr('stroke-opacity', 0)
    .attr('filter', 'url(#boxShadow)')
    .style('cursor', helpers.getCursorForNode)

  // Person's Coin Background Card
  nodeEnter
    .append('rect')
    .attr('id', d => `coin-background-${d.id}`)
    .attr('class', d => (!helpers.getTextForTitle(d) ? 'remove' : 'box coin'))
    .attr('x', nodeWidth / 2 - 16)
    .attr('y', nodeHeight - 2)
    .attr('width', 32)
    .attr('height', 32)
    .attr('fill', backgroundColor)
    .attr('rx', 16)
    .attr('ry', 16)
    .style('cursor', helpers.getCursorForNode)
    .on('click', onClick(config))

  // Person's Coin Text
  nodeEnter
    .append('text')
    .attr('id', d => `coin-text-${d.id}`)
    .attr('class', d => (!helpers.getTextForTitle(d) ? 'remove' : `${PERSON_REPORTS_CLASS} coin-text`))
    .attr('x', nodeWidth / 2)
    .attr('y', nodeHeight + 7)
    .attr('dy', '.9em')
    .style('font-size', 13)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('fill', reportsColor)
    .style("text-anchor", "middle")
    .text(helpers.getTextForTitle)
    .on('click', onClick(config))

// Person Card Shadow
nodeEnter
  .append('rect')
  .attr('width', nodeWidth)
  .attr('height', nodeHeight)
  .attr('id', d => `card-${d.id}`)
  .attr('fill', backgroundColor)
  .attr('rx', nodeBorderRadius)
  .attr('ry', nodeBorderRadius)
  .attr('fill-opacity', 0.13)
  .attr('stroke-opacity', 0)
  .attr('filter', 'url(#boxShadow)')
  .attr('isExpanded', 'false')

// Person Card Container
nodeEnter
  .append('rect')
  .attr('class', d => (d.isHighlight ? `${PERSON_HIGHLIGHT} box` : 'box'))
  .attr('width', nodeWidth)
  .attr('height', nodeHeight)
  .attr('id', d => `cardcontainer-${d.id}`)
  .attr('fill', backgroundColor)
  .attr('rx', nodeBorderRadius)
  .attr('ry', nodeBorderRadius)
  .attr('isExpanded', 'false')
  .style('cursor', 'default')
  .on('click', d => selectCard(d.id) )

  const namePos = {
    x: 74,
    y: 28,
  }

  const avatarPos = {
    x: 13,
    y: 13,
  }

  // Person's Name
  nodeEnter
    .append('text')
    .attr('class', PERSON_NAME_CLASS + ' unedited')
    .attr('x', namePos.x)
    .attr('y', namePos.y)
    .attr('dy', '.3em')
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 14)
    .text(d => d.person.name)

  // Person's Title
  nodeEnter
    .append('text')
    .attr('class', PERSON_TITLE_CLASS + ' unedited')
    .attr('x', namePos.x)
    .attr('y', namePos.y + 21)
    .attr('dy', '0.1em')
    .style('font-size', 12)
    .style('cursor', 'pointer')
    .style('fill', titleColor)
    .text(d => d.person.title)

  const heightForTitle = 60 // getHeightForText(d.person.title)
  
  // Person's Default Avatar
  nodeEnter
    .append('rect')
    .attr('id', d => `avatar-default-${d.id}`)
    .attr('class', 'avatar-default')
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y)
    .attr('width', avatarWidth)
    .attr('height', avatarWidth)
    .attr('rx', avatarWidth / 2)
    .attr('ry', avatarWidth / 2)
  
  // Default Avatar's text
  nodeEnter
    .append('text')
    //.attr('class', 'avatar-default-text')
    .attr('x', avatarPos.x + (avatarWidth / 2))
    .attr('y', avatarPos.y + (avatarWidth / 2))
    .attr('dy', '.35em')
    .style('font-size', 23)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('fill', 'white')
    .style('text-anchor', 'middle')
    .style('cursor', 'default')
    .text(d => helpers.getInitials(d.person.name)) 


  // Person's Avatar
  nodeEnter
    .append('image')
    .attr('id', d => `image-${d.id}`)
    .attr('width', avatarWidth)
    .attr('height', avatarWidth)
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y)
    .attr('stroke', borderColor)
    .attr('s', d => {
      d.person.hasImage
        ? d.person.avatar
        : loadImage(d).then(res => {
            // get image
            covertImageToBase64(res, function(dataUrl) {
              d3.select(`#image-${d.id}`)
                .attr('href', dataUrl)
              d.person.avatar = dataUrl
            })
            d.person.hasImage = true

            /* handle no image
            if (d.person.avatar == null) {
              d3.select(`#image-${d.id}`)
                .classed('no-image', true)
            }*/
            return d.person.avatar
          })
    })
    .attr('src', d => d.person.avatar)
    .attr('href', d => d.person.avatar)
    .attr('clip-path', 'url(#avatarClip)')
    .style('cursor', 'default')

  // Converting to link
  const nodeLink = nodeEnter
    .append('a')
    .attr('class', PERSON_LINK_CLASS)
    .attr('display', d => (d.person.link ? '' : 'none'))
    .attr('xlink:href', d => d.person.link)
    .on('click', datum => {
      d3.event.stopPropagation()
      // TODO: fire link click handler
      if (onPersonLinkClick) {
        onPersonLinkClick(datum, d3.event)
      }
    })

  iconLink({
    svg: nodeLink,
    x: nodeWidth - 20,
    y: 8,
  })

  // Transition nodes to their new position.
  const nodeUpdate = node
    .transition()
    .duration(animationDuration)
    .attr('transform', d => `translate(${d.x},${d.y})`)


  // Employee node expansion button
  nodeEnter
  .append('circle')
    .attr('cx', 252.5)
    .attr('cy', 34.5)
    .attr('r', 16)
    .attr('fill', titleColor)
    .attr('fill-opacity', 0.08)
    .attr('id', d => `expand-${d.id}`)
    .style('cursor', helpers.getCursorForNode)
    .on('click', d => expandCard(d.id) )

  // SVG arrows on employee node expansion button
  nodeEnter
  .append('line')
    .attr("x1", 247)
    .attr("y1", 32)
    .attr("x2", 253.1) 
    .attr("y2", 38)
    .attr('id', d => `arrow-${d.id}`)
    .style("stroke", titleColor)
    .style("stroke-width", 1)

  nodeEnter
  .append('line')
    .attr("x1", 259)
    .attr("y1", 32)
    .attr("x2", 252.9) 
    .attr("y2", 38)
    .attr('id', d => `arrow-${d.id}`)
    .style("stroke", titleColor)
    .style("stroke-width", 1)

  // remove all empty ones
  d3.selectAll('.remove')
    .remove();

  /*nodeUpdate
    .select('rect.box')
    .attr('fill', backgroundColor)*/

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('transform', d => `translate(${parentNode.x},${parentNode.y})`)
    .remove()

  // Update the links
  const link = svg.selectAll('path.link').data(links, d => d.target.id)

  // Wrap the title texts
  const wrapWidth = 200
  svg.selectAll('text.unedited.' + PERSON_NAME_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_TITLE_CLASS).call(wrapText, wrapWidth)

  // Render lines connecting nodes
  renderLines(config)

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })

  var nodeLeftX = -70
  var nodeRightX = 70
  var nodeY = 200
  nodes.map(d => {
    nodeLeftX = d.x < nodeLeftX ? d.x : nodeLeftX
    nodeRightX = d.x > nodeRightX ? d.x : nodeRightX
    nodeY = d.y > nodeY ? d.y : nodeY
  })

  config.nodeRightX = nodeRightX
  config.nodeY = nodeY
  config.nodeLeftX = nodeLeftX * -1

  d3.select(downloadImageId).on('click', function() {
    exportOrgChartImage(config)
  })

  d3.select(downloadPdfId).on('click', function() {
    exportOrgChartPdf(config)
  })
  onConfigChange(config)
}

function expandCard(id) {
  const card = d3.select(`#card-${id}`)
  const cardcontainer = d3.select(`#cardcontainer-${id}`)
  const arrow = d3.selectAll(`#arrow-${id}`)
  const isExpanded = card.attr('isExpanded') == 'true' && cardcontainer.attr('isExpanded') == 'true'

  if(isExpanded) {
    card
      .transition()
      .duration(150)
      .attr('height', 71)
    cardcontainer
      .transition()
      .duration(150)  
      .attr('height', 71)
    arrow.attr('y1', 32)
    arrow.attr('y2', 38)
  }
  else {
    card
      .transition()
      .duration(150)  
      .attr('height', 247)
    cardcontainer
      .transition()
      .duration(150)  
      .attr('height', 247)
    arrow.attr('y2', 31)
    arrow.attr('y1', 37)
  }
  card.attr('isExpanded', isExpanded ? 'false' : 'true')
  cardcontainer.attr('isExpanded', isExpanded ? 'false' : 'true')
};

function selectCard(id) {
  const cardContainer = d3.select(`#cardcontainer-${id}`);
  const coinCard = d3.select(`#coin-background-${id}`);

  console.log("Selecting card: " + id);

  // reset selected card background
  d3.selectAll(`.selected`)
    .classed("selected", false);

  // update selected card
  cardContainer.classed("selected", true);
  coinCard.classed("selected", true);

  //update the correct colours
  d3.selectAll(`.selected`)
    .classed("primary1Color", true);
}

module.exports = render
