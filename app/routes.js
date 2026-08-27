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