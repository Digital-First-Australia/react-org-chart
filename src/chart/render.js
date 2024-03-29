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
const PERSON_DEPARTMENT_CLASS = 'org-chart-person-department'
const PERSON_ABOUTME_CLASS = 'org-chart-person-aboutme'
const PERSON_MOBILENUMBER_CLASS = 'org-chart-person-mobilenumber'
const PERSON_EMAIL_CLASS = 'org-chart-person-email'
const PERSON_SENDMESSAGE_CLASS = 'org-chart-person-sendmessage'
const PERSON_AVATARTEXT_CLASS = 'org-chart-person-avatartext'
import SVGICONS from './assets/svgIcons';

function render(config) {
  const {
    guid,
    svgroot,
    svg,
    tree,
    allowUpperLevelView,
    animationDuration,
    nodeWidth,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    accentColor1,
    accentColor2,
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

  config.expandedCards ? "" : config.expandedCards = []
  
  let nodeHeight = config.nodeHeight
  // Compute the new tree layout.
  const nodes = tree.nodes(treeData).reverse()
  const links = tree.links(nodes)

  config.links = links
  config.nodes = nodes

  nodes.forEach(function(d) {
    
    if(config.expandedCards.length > 0){
      config.expandedCards.forEach(function(id) {
        if(id == d.id){
          nodeHeight = 247;
          d.nodeHeight = nodeHeight 
        }
      })
    }
    // Normalize for fixed-depth.
    d.y = d.depth * lineDepthY
    
    // Instantiate local variables for coin locations
    d.coinYnormal = nodeHeight - 8;
    d.coinYexpanded = nodeHeight + 7;

    // Instantiate local variables for text wrap
    // d.textWrapped = false;

    if (d.isOpen === undefined) {
      if (!d.hasParent) {
        d.isOpen = true; // top node starts expanded
      } else {
        d.isOpen = false;
      }
    }
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
    .attr('transform', `translate(${parentNode.x0}, ${parentNode.y0})`);

  /*const coinWidth = 32
  const coinX = nodeWidth / 2 - (coinWidth / 2)
  const coinY = nodeHeight - 8*/

  let coinWidth = 32;
  let coinX = nodeWidth / 2 - (coinWidth / 2);
  let coinYhover = nodeHeight - 3;

  let parentCoinYhover = 3 - coinWidth;
  let parentCoinYnormal = 8 - coinWidth;

  // Topmost get parent Background Card's Shadow
  nodeEnter
    .append('rect')
    .attr('id', d => `get-parent-shadow-${d.id}`)
    //.attr('class', d => (d.hasParent ? 'remove' : 'box coin'))
    .attr('class', function(d) {
      if(!d.hasParent && d.hasManager && allowUpperLevelView)
      {
        return `box coin`
      }
      return 'remove';
    })
    .attr('x', nodeWidth / 2 - (coinWidth / 2))
    .attr('y', parentCoinYnormal)
    .attr('width', coinWidth)
    .attr('height', coinWidth)
    .attr('fill', backgroundColor)
    .attr('rx', coinWidth / 2)
    .attr('ry', coinWidth / 2)
    .attr('fill-opacity', 0.13)
    .attr('stroke-opacity', 0)
    .attr('filter', 'url(#boxShadow)')
    .style('cursor', helpers.getCursorForNode)
    .on('mouseover', d => parentCoinHoverMove(d, parentCoinYhover))
    .on('mouseout', d => parentCoinHoverMove(d, parentCoinYnormal))

  // Topmost get parent Background Card
  nodeEnter
    .append('rect')
    .attr('id', d => `get-parent-background-${d.id}`)
    //.attr('class', d => (d.hasParent ? 'remove' : 'box coin'))
    .attr('class', function(d) {
      if(!d.hasParent && d.hasManager && allowUpperLevelView)
      {
        return `box coin`
      }
      return 'remove';
    })
    .attr('x', nodeWidth / 2 - (coinWidth / 2))
    .attr('y', parentCoinYnormal)
    .attr('width', coinWidth)
    .attr('height', coinWidth)
    .attr('fill', backgroundColor)
    .attr('rx', coinWidth / 2)
    .attr('ry', coinWidth / 2)
    .style('cursor', helpers.getCursorForNode)
    .on('click', d => onParentClick(config, d))
    .on('mouseover', d => parentCoinHoverMove(d, parentCoinYhover))
    .on('mouseout', d => parentCoinHoverMove(d, parentCoinYnormal))

  // Topmost get parent coin Text
  nodeEnter
    .append('text')
    .attr('id', d => `get-parent-text-${d.id}`)
    .attr('class', function(d) {
      if(!d.hasParent && d.hasManager && allowUpperLevelView)
      {
        return `${PERSON_REPORTS_CLASS} coin-text`
      }
      return 'remove';
      //(d.hasParent ? 'remove' : `${PERSON_REPORTS_CLASS} coin-text`)
    })
    .attr('x', nodeWidth / 2)
    .attr('y', parentCoinYnormal + 9)
    .attr('dy', '.7em')
    .style('font-size', 20)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('fill', reportsColor)
    .style('text-anchor', 'middle')
    .text("+")
    .on('click', d => onParentClick(config, d))
    .on('mouseover', d => parentCoinHoverMove(d, parentCoinYhover))
    .on('mouseout', d => parentCoinHoverMove(d, parentCoinYnormal))

  // Person's Coin Background Card's Shadow
  nodeEnter
    .append('rect')
    .attr('id', d => `coin-shadow-${d.id}`)
    .attr('class', d => (!helpers.getTextForTitle(d) ? 'remove' : 'box coin'))
    .attr('x', coinX)
    .attr('y', d => d.isOpen ? d.coinYexpanded : d.coinYnormal)
    .attr('width', coinWidth)
    .attr('height', coinWidth)
    .attr('fill', backgroundColor)
    .attr('rx', coinWidth / 2)
    .attr('ry', coinWidth / 2)
    .attr('fill-opacity', 0.13)
    .attr('stroke-opacity', 0)
    .attr('filter', 'url(#boxShadow)')
    .style('cursor', helpers.getCursorForNode)
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

  // Person's Coin Background Card
  nodeEnter
    .append('rect')
    .attr('id', d => `coin-background-${d.id}`)
    .attr('class', d => (!helpers.getTextForTitle(d) ? 'remove' : 'box coin'))
    .attr('x', coinX)
    .attr('y', d => d.isOpen ? d.coinYexpanded : d.coinYnormal)
    .attr('width', coinWidth)
    .attr('height', coinWidth)
    .attr('fill', backgroundColor)
    .attr('rx', coinWidth / 2)
    .attr('ry', coinWidth / 2)
    .style('cursor', helpers.getCursorForNode)
    .on('click', onClick(config))
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

  // Person's Coin Text
  nodeEnter
    .append('text')
    .attr('id', d => `coin-text-${d.id}`)
    .attr('class', d => (!helpers.getTextForTitle(d) ? 'remove' : `${PERSON_REPORTS_CLASS} coin-text`))
    .attr('x', nodeWidth / 2)
    .attr('y', d => d.isOpen ? d.coinYexpanded + 9 : d.coinYnormal + 9)
    .attr('dy', d => d.isOpen ? '.6em' : '.9em')
    .style('font-size', d => d.isOpen ? 25 : 13)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('fill', reportsColor)
    .style("text-anchor", "middle")
    .text(d => d.isOpen ? '-' : helpers.getTextForTitle(d))
    .on('click', onClick(config))
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

  // Person Card Shadow
  nodeEnter
    .append('rect')
    .attr('width', nodeWidth)
    .attr('height',  d => d.coinYexpanded - 7)
    .attr('class', 'main-card')
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
    .attr('id', d => `cardcontainer-${d.id}`)
    .attr('class', 
      function(d) {
        // check parent is selected
        if (d.parent !== undefined && d3.select(`#cardcontainer-${d.parent.id}`).classed("selected1")) {
          return 'selected2 box main-card';
        } else {
          return 'box main-card';
        }
      })
    .attr('width', nodeWidth)
    .attr('height',  d => d.coinYexpanded - 7)
    .attr('fill', function(d) {
        
      // check parent is selected
      if (d.parent !== undefined && d3.select(`#cardcontainer-${d.parent.id}`).classed("selected1")) {
        return accentColor2;
      } else {
        return backgroundColor;
      }
    })
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .attr('isExpanded', 'false')
    .style('cursor', 'default')
    .on('click', d => selectCard(d, config))

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
    .attr('class', PERSON_NAME_CLASS + ' unedited main-card')
    .attr('x', namePos.x)
    .attr('y', namePos.y)
    .attr('dy', '.3em')
    .style('cursor', 'default')
    .style('fill', nameColor)
    .style('font-size', 14)
    .text(d => d.person.name)
    .on('click', d => selectCard(d, config))

  // Person's Title
  nodeEnter
    .append('text')
    .attr('class', PERSON_TITLE_CLASS + ' unedited main-card')
    .attr('x', namePos.x)
    .attr('y', namePos.y + 21)
    .attr('dy', '0.1em')
    .style('font-size', 12)
    .style('cursor', 'default')
    .style('fill', titleColor)
    .text(d => d.person.title)
    .on('click', d => selectCard(d, config))

  const heightForTitle = 60 // getHeightForText(d.person.title)

  // Person's Default Avatar
  nodeEnter
    .append('rect')
    .attr('id', d => `avatar-default-${d.id}`)
    .attr('class', 'avatar-default main-card')
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y)
    .attr('width', avatarWidth)
    .attr('height', avatarWidth)
    .attr('rx', avatarWidth / 2)
    .attr('ry', avatarWidth / 2)
    .on('click', d => selectCard(d, config))
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

    // Person's department
    nodeEnter
    .append('text')
    .attr('id', d => `person-department-${d.id}`)
    .attr('class', PERSON_DEPARTMENT_CLASS + ' unedited main-card')
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y + 70)
    .attr('dy', '.3em')
    .attr('width', 260)
    .style('cursor', 'default')
    .style('fill', nameColor)
    .style('font-size', 13)
    .style('font-weight', 500)
    .style('display', 'none')
    .text(function(d) {
      return d.person.department;
    })

    // Person's about me
    nodeEnter
    .append('text')
    .attr('id', d => `person-about-me-${d.id}`)
    .attr('class', PERSON_ABOUTME_CLASS + ' unedited main-card')
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y + 100)
    .attr('dy', '.3em')
    .attr('width', 260)
    .style('cursor', 'default')
    .style('fill', nameColor)
    .style('font-size', 13)
    .style('display', 'none')
    .text(function(d) {
      if (!d.textWrapped && d.person.aboutMe != null && d.person.aboutMe.length > 0) {
        const truncateLen = 18;
        var htmlRemoved = stripHTMLtags(d.person.aboutMe);
        var txtlen = htmlRemoved.split(' ').length;
        var aboutMe = truncate(htmlRemoved, truncateLen);
  
        if (txtlen > truncateLen) {
          aboutMe = aboutMe + "...";
        }
        d.person.aboutMe = aboutMe;
        return aboutMe;
      }
      else {
        return d.person.aboutMe;
      }
    })

    //Email icon
    nodeEnter.append("svg:image")
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y + 145)
    .attr('width', 20)
    .attr('height', 24)
    .attr("href", 'data:image/svg+xml;base64,' + SVGICONS.SVG_EMAIL)
    .attr('id', d => `email-svg-${d.id}`)
    .style('cursor', 'default')
    .style('display', 'none')

    // Person's email 
    nodeEnter
    .append('text')
    .attr('id', d => `person-email-${d.id}`)
    .attr('class', PERSON_EMAIL_CLASS + ' unedited main-card')
    .attr('x', avatarPos.x + 30)
    .attr('y', avatarPos.y + 156)
    .attr('dy', '.3em')
    .attr('width', 260)
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 13)
    .style('display', 'none')
    .append('a') 
    .html(d => d.person.email ? d.person.email.toLowerCase() : "NO EMAIL!")
    .attr('href', d => d.person.email ? `mailto::${d.person.email}` : "NO EMAIL!")

    //Phone icon
    nodeEnter.append("svg:image")
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y + 169)
    .attr('width', 20)
    .attr('height', 24)
    .attr("href", 'data:image/svg+xml;base64,' + SVGICONS.SVG_PHONE)
    .attr('id', d => `phone-svg-${d.id}`)
    .style('cursor', 'default')
    .style('display', 'none')

    // Person's mobile number 
    nodeEnter
    .append('text')
    .attr('id', d => `person-mobile-number-${d.id}`)
    .attr('class', PERSON_MOBILENUMBER_CLASS + ' unedited main-card')
    .attr('x', avatarPos.x + 30)
    .attr('y', avatarPos.y + 180)
    .attr('dy', '.3em')
    .attr('width', 260)
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 13)
    .style('display', 'none')
    .append('a')
    .html(d => d.person.mobileNumber)
    .attr('href', d => `tel:${d.person.mobileNumber}`)

  //Speech icon
  nodeEnter.append("svg:image")
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y + 194)
    .attr('width', 20)
    .attr('height', 24)
    .attr("href", 'data:image/svg+xml;base64,' + SVGICONS.SVG_SPEECH)
    .attr('id', d => `speech-svg-${d.id}`)
    .style('cursor', 'default')
    .style('display', 'none')

    // Person's mobile number 
    nodeEnter
    .append('text')
    .attr('id', d => `person-sendmessage-${d.id}`)
    .attr('class', PERSON_SENDMESSAGE_CLASS + ' unedited main-card')
    .attr('x', avatarPos.x + 30)
    .attr('y', avatarPos.y + 204)
    .attr('dy', '.3em')
    .attr('width', 260)
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 13)
    .style('display', 'none')
    .append('a')
    .html("Send Message")
    .attr('href', d => (d.person.email ? `https://teams.microsoft.com/l/chat/0/0?users=${d.person.email.toLowerCase()}` : 'NO EMAIL!'))
    .attr('target', '_blank')

  // Default Avatar's text
  nodeEnter
    .append('text')
    //.attr('class', 'avatar-default-text')
    .attr('class', PERSON_AVATARTEXT_CLASS + ' unedited main-card')
    .attr('x', avatarPos.x + (avatarWidth / 2))
    .attr('y', avatarPos.y + (avatarWidth / 2))
    .attr('dy', '.35em')
    .style('font-size', 23)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('fill', 'white')
    .style('text-anchor', 'middle')
    .style('cursor', 'default')
    .attr('width', 150)
    .text(d => helpers.getInitials(d.person.name))
    .on('click', d => selectCard(d, config))
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

  // Person's Avatar
  nodeEnter
    .append('image')
    .attr('id', d => `image-${d.id}`)
    .attr('class', 'main-card')
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

            return d.person.avatar
          })
    })
    .attr('src', d => d.person.avatar)
    .attr('href', d => d.person.avatar)
    .attr('clip-path', 'url(#avatarClip)')
    .style('cursor', 'default')
    .on('click', d => selectCard(d, config))
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

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
    .attr('id', d => `expand-${d.id}`)
    .attr('class', 'main-card')  
    .attr('cx', 252.5)
    .attr('cy', 34.5)
    .attr('r', 16)
    .attr('fill', titleColor)
    .attr('fill-opacity', 0.08)
    .style('cursor', helpers.getCursorForNode)
    .on('click', d => expandCard(d.id, d, config) )
    .on('mouseover', d => coinHoverMove(d, coinYhover))
    .on('mouseout', d => coinHoverMove(d, d.coinYnormal))

  // SVG arrows on employee node expansion button
  nodeEnter
  .append('line')
    .attr('id', d => `arrow-${d.id}`)
    .attr('class', 'main-card')    
    .attr("x1", 247)
    .attr("y1", 32)
    .attr("x2", 253.1) 
    .attr("y2", 38)
    .style("stroke", titleColor)
    .style("stroke-width", 1)
    .style('cursor', helpers.getCursorForNode)
    .on('click', d => expandCard(d.id, d, config) )

  nodeEnter
  .append('line')
    .attr('id', d => `arrow-${d.id}`)
    .attr('class', 'main-card')   
    .attr("x1", 259)
    .attr("y1", 32)
    .attr("x2", 252.9) 
    .attr("y2", 38)
    .style("stroke", titleColor)
    .style("stroke-width", 1)
    .style('cursor', helpers.getCursorForNode)
    .on('click', d => expandCard(d.id, d, config) )

  // remove all empty ones
  d3.selectAll('.remove')
    .remove(); //TODO: This might not work if there aren't any to remove

  // expand out coins on hover  
  d3.selectAll('.main-card')
    .on('mouseover', function(d) {
      parentCoinHoverMove(d, parentCoinYhover);
      coinHoverMove(d, coinYhover);
    })
    .on('mouseout', function(d) { 
      parentCoinHoverMove(d, parentCoinYnormal);
      coinHoverMove(d, d.coinYnormal);
    })
      

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('transform', d => `translate(${parentNode.x},${parentNode.y})`)
    .remove()

  // Update the links
  console.log("ERWIN links", links)
  const link = svg.selectAll('path.link').data(links, d => d.target.id)

  console.log("ERWIN link", link)
  // Wrap the texts
  const wrapWidth = 160;
  const wrapWidthFull = 260;
  svg.selectAll('text.unedited.' + PERSON_NAME_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_TITLE_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_DEPARTMENT_CLASS).call(wrapText, wrapWidthFull)
  svg.selectAll('text.unedited.' + PERSON_ABOUTME_CLASS).call(wrapText, wrapWidthFull)
  //svg.selectAll('text.unedited.' + PERSON_MOBILENUMBER_CLASS).call(wrapText, wrapWidthFull)
  svg.selectAll('text.unedited.' + PERSON_AVATARTEXT_CLASS).call(wrapText, wrapWidthFull)


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
  config.nodeY = nodeY + 50
  config.nodeLeftX = nodeLeftX * -1

  d3.select(downloadImageId).on('click', function() {
    exportOrgChartImage(config)
  })

  d3.select(downloadPdfId).on('click', function() {
    exportOrgChartPdf(config)
  })
  onConfigChange(config)
}

function expandCard(id, d, config) {
  console.log("ERWIN config", config)
  const card = d3.select(`#card-${id}`)
  const cardcontainer = d3.select(`#cardcontainer-${id}`)
  const arrow = d3.selectAll(`#arrow-${id}`)
  const isExpanded = card.attr('isExpanded') == 'true' && cardcontainer.attr('isExpanded') == 'true'

  const department = d3.select(`#person-department-${id}`)
  const aboutMe = d3.select(`#person-about-me-${id}`)
  const email = d3.select(`#person-email-${id}`)
  const mobile = d3.select(`#person-mobile-number-${id}`)
  const message = d3.select(`#person-sendmessage-${id}`)
  const phonesvg = d3.select(`#phone-svg-${id}`)
  const speechsvg = d3.select(`#speech-svg-${id}`)
  const emailsvg = d3.select(`#email-svg-${id}`)

  if(isExpanded) {

    const index = config.expandedCards.indexOf(id);

    if(index >= 0){
      config.expandedCards.splice(index, 1);
    }
    
    card
      .transition()
      .duration(150)
      .attr('height', 80)
    cardcontainer
      .transition()
      .duration(150)  
      .attr('height', 80)
    arrow.attr('y1', 32)
    arrow.attr('y2', 38)
    
    department.style('display', 'none')
    aboutMe.style('display', 'none')
    email.style('display', 'none')
    mobile.style('display', 'none')
    message.style('display', 'none')
    emailsvg.style('display', 'none')
    phonesvg.style('display', 'none')
    speechsvg.style('display', 'none')
  }
  else {
    //ADD ID TO EXPANDED CARDS
    config.expandedCards.push(id);
    //UPDATE LINES
    //renderLines(config, true);
    card
      .transition()
      .duration(150)  
      .attr('height', 247)
    cardcontainer
      .transition()
      .duration(150)  
      .attr('height', 247)
      .each('end', function() {
        department.style('display', 'inline')
        aboutMe.style('display', 'inline')        
        email.style('display', 'inline')
        mobile.style('display', 'inline')
        message.style('display', 'inline')
        emailsvg.style('display', 'inline')
        phonesvg.style('display', 'inline')
        speechsvg.style('display', 'inline')

        if(!d.textWrapped)
        {
          const wrapWidth = 260;
          department.call(wrapText, wrapWidth)
          aboutMe.call(wrapText, wrapWidth)
          //email.call(wrapText, wrapWidth)
          //mobile.call(wrapText, wrapWidth)
        d.textWrapped = true;
        }
      })
    arrow.attr('y2', 31)
    arrow.attr('y1', 37)
  }
  card.attr('isExpanded', isExpanded ? 'false' : 'true')
  cardcontainer.attr('isExpanded', isExpanded ? 'false' : 'true')
  console.log("ERWIN RENDER CONFIG", config)
  render(config)
};

function coinHoverMove(d, coinYnew) {
  let transitionDuration = 200;
  
  if (!d.isOpen) {
    d3.select(`#coin-background-${d.id}`)
      .transition()
      .duration(transitionDuration)
      .attr('y', coinYnew);
    d3.select(`#coin-shadow-${d.id}`)
      .transition()
      .duration(transitionDuration)
      .attr('y', coinYnew);
    d3.select(`#coin-text-${d.id}`)
      .transition()
      .duration(transitionDuration)
      .attr('y', coinYnew + 9);
  }
}

function parentCoinHoverMove(d, parentCoinYnew) {
  let transitionDuration = 200;
  
  d3.select(`#get-parent-background-${d.id}`)
    .transition()
    .duration(transitionDuration)
    .attr('y', parentCoinYnew);
  d3.select(`#get-parent-shadow-${d.id}`)
    .transition()
    .duration(transitionDuration)
    .attr('y', parentCoinYnew);
  d3.select(`#get-parent-text-${d.id}`)
    .transition()
    .duration(transitionDuration)
    .attr('y', parentCoinYnew + 9);
}

function selectCard(d, config) {
  const cardContainer = d3.select(`#cardcontainer-${d.id}`);
  const coinCard = d3.select(`#coin-background-${d.id}`);
  const parentCoinCard = d3.select(`#get-parent-background-${d.id}`);

  // reset selected card background
  d3.selectAll(`.selected1, .selected2`)
    .attr('fill', config.backgroundColor)
    .classed("selected1", false)
    .classed("selected2", false);

  // update selected card
  cardContainer
    .attr('fill', config.accentColor1)
    .classed("selected1", true);
  coinCard
    .attr('fill', config.accentColor1)
    .classed("selected1", true);
  
  // update parent coin card if it exists
  if (parentCoinCard)  {
    parentCoinCard
      .attr('fill', config.accentColor1)
      .classed("selected1", true);
  }

  // update children color as well
  if (d.children) {
    d.children.forEach(function (datum) {
      d3.select(`#cardcontainer-${datum.id}`)
        .attr('fill', config.accentColor2)
        .classed("selected2", true);
      d3.select(`#coin-background-${datum.id}`)
        .attr('fill', config.accentColor2)
        .classed("selected2", true);
    })
  }
}

function truncate(text, numberofwords) {
  var truncatedtext =  text.split(" ").splice(0,numberofwords).join(" ");
  truncatedtext = truncatedtext.split(/,(?=\S)/).join(", ");
  return truncatedtext;
}

function stripHTMLtags(text) {
  var cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
  cleanText = cleanText.replace("&quot;","'");
  return cleanText;
}

module.exports = render
