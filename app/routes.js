const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const ggisSchemes = require('./data/ggis-schemes')
const findAGrantSearchMock = require('./data/find-a-grant-search-mock')
const signedSearchMock = require('./data/signed-search-mock')

function formatSchemeDate (dateString) {
  if (!dateString) {
    return dateString
  }

  const [year, month, day] = dateString.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function getSelectedStatuses (requestedStatuses) {
  const statuses = Array.isArray(requestedStatuses) ? requestedStatuses : [requestedStatuses]
  const validStatuses = statuses.filter(function (status) {
    return ['all', 'open', 'upcoming'].includes(status)
  })

  if (!validStatuses.length || validStatuses.includes('all')) {
    return ['all']
  }

  return Array.from(new Set(validStatuses))
}

function buildSearchQuery (searchKeyword, selectedStatuses) {
  const params = new URLSearchParams({ searchKeyword })
  selectedStatuses.forEach(function (status) {
    params.append('status', status)
  })
  return params.toString()
}

router.get('/', function (req, res) {
  res.render('index')
})

router.get('/start', function (req, res) {
  res.render('start')
})

router.get('/search', function (req, res) {
  const searchKeyword = String(req.query.searchKeyword || req.query.search || '').trim()
  const searchText = searchKeyword.toLowerCase()
  const selectedStatuses = getSelectedStatuses(req.query.status)
  const activeStatuses = selectedStatuses.includes('all') ? ['open', 'upcoming'] : selectedStatuses
  const matchingGrants = activeStatuses.includes('open')
    ? findAGrantSearchMock.filter(function (grant) {
        return grant.status === 'open' && (!searchText || grant.searchableText.includes(searchText))
      })
    : []
  const matchingIds = new Set(matchingGrants.map(function (grant) {
    return grant.id
  }))
  const visibleResults = Object.fromEntries(findAGrantSearchMock.map(function (grant) {
    return [grant.id, matchingIds.has(grant.id)]
  }))
  const schemeResults = activeStatuses.includes('upcoming')
    ? ggisSchemes.map(function (scheme, recordIndex) {
        return { scheme, recordIndex }
      }).filter(function (item) {
        const searchableText = [
          item.scheme['Scheme Name'],
          item.scheme.Funder,
          item.scheme['Managed By']
        ].join(' ').toLowerCase()
        return !searchText || searchableText.includes(searchText)
      })
    : []
  const resultsCount = matchingGrants.length + schemeResults.length
  const searchQuery = buildSearchQuery(searchKeyword, selectedStatuses)
  const statusOptions = [
    { value: 'all', text: 'All opportunities', checked: selectedStatuses.includes('all') },
    { value: 'open', text: 'Open for applications', checked: selectedStatuses.includes('open') },
    { value: 'upcoming', text: 'Planned grants', checked: selectedStatuses.includes('upcoming') }
  ]

  res.render('search', {
    searchKeyword,
    selectedStatuses,
    statusOptions,
    visibleResults,
    schemeResults,
    resultsCount,
    searchQuery
  })
})

router.get('/signed-search', function (req, res) {
  const searchKeyword = String(req.query.searchKeyword || req.query.search || '').trim()
  const searchText = searchKeyword.toLowerCase()
  const selectedStatuses = getSelectedStatuses(req.query.status)
  const activeStatuses = selectedStatuses.includes('all') ? ['open', 'upcoming'] : selectedStatuses
  const matchingGrants = activeStatuses.includes('open')
    ? signedSearchMock.filter(function (grant) {
        return !searchText || grant.searchableText.includes(searchText)
      })
    : []
  const matchingIds = new Set(matchingGrants.map(function (grant) {
    return grant.id
  }))
  const visibleResults = Object.fromEntries(signedSearchMock.map(function (grant) {
    return [grant.id, matchingIds.has(grant.id)]
  }))
  const schemeResults = activeStatuses.includes('upcoming')
    ? ggisSchemes.map(function (scheme, recordIndex) {
        return { scheme, recordIndex }
      }).filter(function (item) {
        const searchableText = [
          item.scheme['Scheme Name'],
          item.scheme.Funder,
          item.scheme['Managed By']
        ].join(' ').toLowerCase()
        return !searchText || searchableText.includes(searchText)
      })
    : []
  const resultsCount = matchingGrants.length + schemeResults.length
  const searchQuery = buildSearchQuery(searchKeyword, selectedStatuses)
  const statusOptions = [
    { value: 'all', text: 'All opportunities', checked: selectedStatuses.includes('all') },
    { value: 'open', text: 'Open for applications', checked: selectedStatuses.includes('open') },
    { value: 'upcoming', text: 'Planned grants', checked: selectedStatuses.includes('upcoming') }
  ]

  res.render('signed-search', {
    searchKeyword,
    selectedStatuses,
    statusOptions,
    visibleResults,
    schemeResults,
    resultsCount,
    searchQuery
  })
})

router.get('/results', function (req, res) {
  res.render('results')
})

router.get('/grant', function (req, res) {
  res.render('grant')
})

router.get('/future-grants', function (req, res) {
  res.render('future-grants-search')
})

router.get('/future-grants/results', function (req, res) {
  const searchTerm = String(req.query.q || '').trim()
  const searchText = searchTerm.toLowerCase()
  const schemes = ggisSchemes.map(function (scheme, recordIndex) {
    return { scheme, recordIndex }
  }).filter(function (item) {
    const scheme = item.scheme
    const searchableText = [scheme['Scheme Name'], scheme.Funder].join(' ').toLowerCase()
    return !searchText || searchableText.includes(searchText)
  })
  const searchQuery = new URLSearchParams({ q: searchTerm }).toString()

  res.render('future-grants-results', {
    schemes,
    searchTerm,
    searchQuery,
    formatSchemeDate
  })
})

router.get('/future-grants/scheme/:recordIndex', function (req, res) {
  const recordIndex = Number(req.params.recordIndex)
  const scheme = Number.isInteger(recordIndex) ? ggisSchemes[recordIndex] : null

  if (!scheme) {
    return res.status(404).send('Scheme not found')
  }

  const searchTerm = String(req.query.searchKeyword || req.query.q || '').trim()
  const selectedStatuses = getSelectedStatuses(req.query.status)
  const searchQuery = buildSearchQuery(searchTerm, selectedStatuses)
  const searchPath = req.query.searchPath === 'signed-search' ? '/signed-search' : '/search'

  res.render('future-grant-details', { scheme, searchQuery, formatSchemeDate, searchPath })
})

router.get('/feedback', function (req, res) {
  res.render('feedback')
})

router.get('/about-us', function (req, res) {
  res.render('about-us')
})

// Route to capture and save organisation type
router.post('/save-organisation-type', function (req, res) {
  req.session.data['organisationType'] = req.body['organisationType']
  res.redirect('/your-saved-information')
})

// Route to capture and save name
router.post('/save-name', function (req, res) {
  req.session.data['name'] = req.body['name']
  res.redirect('/your-saved-information')
})

// Route to capture and save address
router.post('/save-address', function (req, res) {
  req.session.data['addressLine1'] = req.body['addressLine1']
  req.session.data['addressLine2'] = req.body['addressLine2']
  req.session.data['addressTown'] = req.body['addressTown']
  req.session.data['addressCounty'] = req.body['addressCounty']
  req.session.data['addressPostcode'] = req.body['addressPostcode']
  res.redirect('/your-saved-information')
})

module.exports = router