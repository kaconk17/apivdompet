const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const cors = require ('cors');
var userRoute = require ('./app/routes/userRoute');
var dompetRoute = require('./app/routes/dompetRoute');

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use('/api', userRoute);
app.use('/api', dompetRoute);



app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
  })


  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })

  