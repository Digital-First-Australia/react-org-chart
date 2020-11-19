module.exports = onParentClick

function onParentClick(configOnClick, d) {
  //event.preventDefault()

  // console.log("Clicked on get parent of the card:");
  // console.log(d);

  const { loadConfig } = configOnClick
  const config = loadConfig()
  const { loadParent } = config

  // If this person have `hasParent` is true,
  // attempt to load using the `loadParent` config function
  if (d.parent == null || !d.parent) {
    if (!loadParent) {
      console.error('react-org-chart.onClick: loadParent() not found in config')
      return
    }

    const result = loadParent(d)
    const handler = handleResult(config, d)

    // Check if the result is a promise and render the children
    if (result.then) {
      console.log("Returning result")
      return result.then(handler)
    } else {
      console.log("Returning handler")
      return handler(result)
    }
  }

  // console.log("Doesn't have a parent");
}

function handleResult(config, d) {
  const { render } = config

  return datum => {

    // Datum is the new boss

    // console.log("Datum");
    // console.log(datum);
    // console.log("Children");
    // console.log(datum.children);
    
    if (datum.children == undefined) {
      
      // there's no parent! Get rid of the + button
      d3.select(`#get-parent-background-${d.id}`)
        .style("visibility", "hidden");
      d3.select(`#get-parent-shadow-${d.id}`)
        .style("visibility", "hidden");
      d3.select(`#get-parent-text-${d.id}`)
        .style("visibility", "hidden");

      return null;
    }

    // set the parent
    d.parent = datum;

    // update its children
    const children = datum.children.map(item => {
      if (item.id === d.id) {
        item.hasParent = true;
        d.hasParent = true;
        return { ...item, ...d }
      } else {
        return item
      }
    })

    // Get rid of + button
    // there's no parent! Get rid of the + button
    d3.select(`#get-parent-background-${d.id}`)
      .style("visibility", "hidden");
    d3.select(`#get-parent-shadow-${d.id}`)
      .style("visibility", "hidden");
    d3.select(`#get-parent-text-${d.id}`)
      .style("visibility", "hidden");

    const result = { ...datum, children }

    // Pass in the newly rendered datum as the sourceNode
    // which tells the child nodes where to animate in from
    render({
      ...config,
      treeData: { ...result, children, _children: children },
      sourceNode: d, //result,
    })
  }
}