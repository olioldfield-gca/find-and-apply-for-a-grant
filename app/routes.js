//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.get('/', function (req, res) {
  res.render('index')
})

router.get('/start', function (req, res) {
  res.render('start')
})

router.get('/search', function (req, res) {
  res.render('search')
})

router.get('/results', function (req, res) {
  res.render('results')
})

router.get('/grant', function (req, res) {
  res.render('grant')
})

router.get('/feedback', function (req, res) {
  res.render('feedback')
})

router.get('/about-us', function (req, res) {
  res.render('about-us')
})

