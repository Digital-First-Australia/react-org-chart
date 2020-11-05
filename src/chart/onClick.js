const d3 = require('d3')
const { helpers, collapse } = require('../utils')

module.exports = onClick

function onClick(configOnClick) {
  const { loadConfig } = configOnClick

  return datum => {

    console.log("Datum")
    console.log(datum);

    if (d3.event.defaultPrevented) return
    const config = loadConfig()
    const { loadChildren, render, onPersonClick } = config
    event.preventDefault();

    if (onPersonClick) {
      const result = onPersonClick(datum, d3.event)
      // If the `onPersonClick` handler returns `false`
      // Cancel the rest of this click handler
      if (typeof result === 'boolean' && !result) {
        console.log("Returned false!")
        return
      }
    }

    // If this person doesn't have children but `hasChild` is true,
    // attempt to load using the `loadChildren` config function
    if ((datum.children == null || !datum.children || datum.children.length <= 0) 
        && (datum._children == null || !datum._children || datum._children.length <= 0) 
        && datum.hasChild) {
      if (!loadChildren) {
        console.error(
          'react-org-chart.onClick: loadChildren() not found in config'
        )
        return
      }

      moveCoinDown(datum);

      const result = loadChildren(datum)
      const handler = handleChildrenResult(config, datum)

      // Check if the result is a promise and render the children
      if (result.then) {
        console.log("Returning result.then(handler)")
        return result.then(handler)
      } else {
        console.log("Returning handler(result)")
        return handler(result)
      }
    }

    if (datum.children) {
      // Collapse the children
      config.callerNode = datum
      config.callerMode = 0
      datum._children = datum.children
      datum.children = null

      moveCoinUp(datum);
    
      } else {
      // Expand the children
      config.callerNode = datum
      config.callerMode = 1
      datum.children = datum._children
      datum._children = null

      moveCoinDown(datum);
    }

    console.log("Datum at end:")
    console.log(datum);

    // Pass in the clicked datum as the sourceNode which
    // tells the child nodes where to animate in from
    render({
      ...config,
      sourceNode: datum,
    })
  }
}

function moveCoinDown(datum) {
  const transitionDuration = 300;
  datum.isOpen = true;

  // move coin down
  d3.select(`#coin-background-${datum.id}`)
    .transition()
    .duration(transitionDuration)  
    .attr('y', datum.coinYexpanded)
  d3.select(`#coin-shadow-${datum.id}`)
    .transition()
    .duration(transitionDuration)  
    .attr('y', datum.coinYexpanded)

  // change coin text
  d3.select(`#coin-text-${datum.id}`)
    .text('-')
    .style("font-size", "25")
    .attr('dy', '.6em')
    .transition()
    .duration(transitionDuration)  
    .attr('y', datum.coinYexpanded + 9);
}

function moveCoinUp(datum) {
  const transitionDuration = 300;
  datum.isOpen = false;

  // move coin up
  d3.select(`#coin-background-${datum.id}`)
    .transition()
    .duration(transitionDuration)  
    .attr('y', datum.coinYnormal)
  d3.select(`#coin-shadow-${datum.id}`)
    .transition()
    .duration(transitionDuration)  
    .attr('y', datum.coinYnormal)

  // change coin text
  d3.select(`#coin-text-${datum.id}`)
    .style("font-size", "13")
    .attr('dy', '.9em')
    .text(helpers.getTextForTitle(datum))
    .transition()
    .duration(transitionDuration)  
    .attr('y', datum.coinYnormal + 9);
}

function handleChildrenResult(config, datum) {
  const { tree, render } = config

  return children => {
    
    console.log("Handling Children Result")
    
    const result = {
      ...datum,
      children,
    }

    // Collapse the nested children
    children.forEach(collapse)

    result.children.forEach(child => {
      if (!tree.nodes(datum)[0]._children) {
        tree.nodes(datum)[0]._children = []
      }

      child.x = datum.x
      child.y = datum.y
      child.x0 = datum.x0
      child.y0 = datum.y0

      tree.nodes(datum)[0]._children.push(child)
    })

    if (datum.children) {
      // Collapse the children
      config.callerNode = datum
      config.callerMode = 0
      datum._children = datum.children
      datum.children = null
    } else {
      // Expand the children
      config.callerNode = null
      config.callerMode = 1
      datum.children = datum._children
      datum._children = null
    }

    // Pass in the newly rendered datum as the sourceNode
    // which tells the child nodes where to animate in from
    render({
      ...config,
      sourceNode: result,
    })
  }
}
