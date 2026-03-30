const dns = require('dns')
dns.setServers(['8.8.8.8','8.8.4.4'])
const dotenv = require('dotenv')
dotenv.config({ path: './.development.env' })
const mongoose = require('mongoose')
const app = require('./app')

mongoose.connect(process.env.DATABASE_URL).then(() =>
  console.log("DataBase Connected Successfully🎉🎉🎉")
).catch((err) => console.log(console.error('Error connecting to MongoDB:🤦‍♂️🤦‍♂️🤦‍♂️', err))
)

const port = process.envPORT || 3000
app.listen(port, () => {
  console.log(`App Is Running on http://localhost:${port}!!!😁😁😁`);
})
