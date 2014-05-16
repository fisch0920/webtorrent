var express = require('express.io'),
    path    = require('path'),
    exphbs  = require('express3-handlebars')

var app = express()
app.http().io()

app.configure(function () {
  app.set('port', process.env.PORT || 3000)
  app.set('views', path.join(__dirname, 'views'))
  app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
  app.set('view engine', '.hbs')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function () {
  app.use(express.errorHandler())
})

app.get('/', function(req, res) {
  res.render('index', { title: 'Webtorrent.io' })
})

app.listen(app.get('port'))

