module.exports = {
  getTextForTitle,
  getTextForDepartment,
  getCursorForNode,
  getInitials,
}

function getTextForTitle(datum) {
  if (!datum.person || !datum.person.totalReports) {
    return ''
  }

  const {
    person: { totalReports },
  } = datum

  return `+${totalReports}`
}

const departmentAbbrMap = {
  Marketing: 'mktg',
  Operations: 'ops',
  Growth: 'gwth',
  Branding: 'brand',
  Assurance: 'fin',
  Data: 'data',
  Design: 'design',
  Communications: 'comms',
  Product: 'prod',
  People: 'people',
  Sales: 'sales',
}

function getTextForDepartment(datum) {
  if (!datum.person.department) {
    return ''
  }

  const { department } = datum.person

  if (departmentAbbrMap[department]) {
    return departmentAbbrMap[department].toUpperCase()
  }

  return datum.person.department.substring(0, 3).toUpperCase()
}

function getCursorForNode(datum) {
  return datum.children || datum._children || datum.hasChild
    ? 'pointer'
    : 'default'
}

// Takes a name and returns its initials
function getInitials(string) {
  let names = string.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  
  if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}