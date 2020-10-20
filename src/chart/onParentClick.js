module.exports = onParentClick

function onParentClick(configOnClick, d) {
  //event.preventDefault()

  console.log("Clicked on get parent!");
  console.log(d);

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

  console.log("Doesn't have a parent");
}

function handleResult(config, d) {
  const { render } = config

  return datum => {
    const children = datum.children.map(item => {
      if (item.id === d.id) {
        return { ...item, ...d }
      } else {
        return item
      }
    })

    const result = { ...datum, children }

    console.log("Rendering again");

    // Pass in the newly rendered datum as the sourceNode
    // which tells the child nodes where to animate in from
    render({
      ...config,
      treeData: { ...result, children, _children: null },
      sourceNode: result,
    })
  }
}