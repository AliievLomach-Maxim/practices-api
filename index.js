import express from 'express'
import cors from 'cors'
import passport from 'passport'
import authMiddleware from './src/middleware/authMiddleware.js'
import { getCars, addCar, test } from './src/cars.js'
import { login } from './src/auth.js'

const app = express()
app.use(cors())
app.options('*', cors())

app.use(passport.initialize())
authMiddleware(passport)

const PORT = 3333

app.use(express.json())

app.get('/test', test)
app.get('/users', passport.authenticate('jwt', { session: false }), getCars)
app.post('/auth', login)

app.post('/users', addCar)

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
