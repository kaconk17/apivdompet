const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const cors = require ('cors');
var userRoute = require ('./app/routes/userRoute');

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use('/vdompet', userRoute);
app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
  })


  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })

  