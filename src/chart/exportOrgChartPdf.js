const {jsPDF} = require('jspdf')

module.exports = exportOrgChartPdf

function exportOrgChartPdf({ loadConfig }) {
  const config = loadConfig()
  const {
    guid,
    id,
    downlowdedOrgChart,
    nodeLeftX,
    nodeRightX,
    nodeY,
    nodeHeight,
    margin,
  } = config

  // a4 width and heigth for landscape
  //const a4Width = 3508
  //const a4Height = 2480

  // svg width and height
  // calculating ratio for better quality if the svgWidth is less than a4Width
  let svgWidth = (nodeLeftX  * 3) + nodeRightX
  let svgHeight = nodeY + nodeHeight
  let ratio = 2

  // checking wether it has canvas in the convas-container div
  document.getElementById(`${id}-canvas-container`).querySelector('canvas')
    ? document
        .getElementById(`${id}-canvas-container`)
        .querySelector('canvas')
        .remove()
    : ''
  document.getElementById('canvas1') ? document.getElementById('canvas1').remove() : "";

  // creating a canvas element
  var canvas1 = document.createElement('canvas')
  canvas1.id = 'canvas1'
  canvas1.width = svgWidth * ratio
  canvas1.height = svgHeight * ratio
  document.getElementById(`${id}-canvas-container`).appendChild(canvas1)

  console.log("canvas1.width");
  console.log(canvas1.width);
  console.log("canvas1.height");
  console.log(canvas1.height);

  // creating duplicate org chart svg from original org chart svg
  var step = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  step.id = 'newsvg-'+ guid;
  step.setAttribute('width', svgWidth)
  step.setAttribute('height', svgHeight)
  step.setAttribute('viewBox', `${-nodeLeftX} 0 ${svgWidth} ${svgHeight + 200}`)
  step.innerHTML = document.getElementById('svg-'+ guid).innerHTML

  document.getElementById(`${id}-svg-container`).querySelector('svg')
    ? document
        .getElementById(`${id}-svg-container`)
        .querySelector('svg')
        .remove()
    : ''
  document.getElementById(`${id}-svg-container`).appendChild(step)

  // appending g element from svg
  var g = document.getElementById(`${id}-svg-container`).querySelector('g')
  g.setAttribute('transform', `translate(0,0)`)
  var html = new XMLSerializer().serializeToString(
    document.getElementById(`${id}-svg-container`).querySelector('svg')
  )

  // generating image with base 64
  const imgSrc = 'data:image/svg+xml;base64,' + btoa(html)
  const canvas = document.getElementById('canvas1')
  const context = canvas.getContext('2d')
  const image = new Image()
  image.src = imgSrc

  // downloading the image
  image.onload = function() {
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const canvasData = canvas.toDataURL('image/jpeg,1.0')

    const pdf = new jsPDF({
      orientation: 'l',
      unit: 'px',
      format: [canvas.width, canvas.height + 150],
      hotfixes: ["px_scaling"]
    })

    pdf.addImage(canvasData, 'JPEG', 0, 150, canvas.width, canvas.height)
    pdf.save('Orgchart.pdf')
    downlowdedOrgChart(true)
  }
}
