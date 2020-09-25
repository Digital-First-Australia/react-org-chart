const { createElement, PureComponent } = require('react')
const { init } = require('../chart')

class OrgChart extends PureComponent {
  render() {
    const { id } = this.props

    return createElement('div', {
      id,
    })
  }

  static defaultProps = {
    id: 'react-org-chart',
    downloadImageId: 'download-image',
    downloadPdfId: 'download-pdf',
    zoomInId: 'zoom-in',
    zoomOutId: 'zoom-out',
    zoomExtentId: 'zoom-extent',
  }

  componentDidMount() {
    const {
      id,
      downloadImageId,
      downloadPdfId,
      zoomInId,
      zoomOutId,
      zoomExtentId,
      tree,
      initialZoom,
      ...options
    } = this.props

    init({
      id: `#${id}`,
      downloadImageId: `#${downloadImageId}`,
      downloadPdfId: `#${downloadPdfId}`,
      zoomInId: zoomInId,
      zoomOutId: zoomOutId,
      zoomExtentId: zoomExtentId,
      initialZoom: initialZoom,
      data: tree,
      ...options,
    })
  }
}

module.exports = OrgChart