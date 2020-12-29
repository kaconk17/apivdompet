const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const cors = require ('cors');
var userRoute = require ('./app/routes/userRoute');
var dompetRoute = require('./app/routes/dompetRoute');
var inRoute = require('./app/routes/inRoute');
var outRoute = require('./app/routes/outRoute')

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use('/api', userRoute);
app.use('/api', dompetRoute);
app.use('/api', inRoute);
app.use('/api',outRoute);


app.get('/', (request, response) => {
    response.json({ info: 'vdompet API Node.js, Express, and Postgres' })
  })


  app.listen(process.env.PORT || port, () => {
    console.log(`App running on port ${port}.`)
  })

  