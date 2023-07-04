import express from 'express'
import passport from 'passport'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'

import usersRoutes from './src/routes/users.js'
import authRoutes from './src/routes/auth.js'
import postsRoutes from './src/routes/posts.js'
import commentsRoutes from './src/routes/comments.js'
import authMiddleware from './src/middleware/authMiddleware.js'
import { client } from './src/config/dbconnect.js'

const PORT = process.env.PORT || 3333

const swaggerFilePath = path.resolve(process.cwd(), './src/swagger/output.json')
const swaggerFile = JSON.parse(fs.readFileSync(swaggerFilePath))

const app = express()

const CSS_URL =
	'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css'

app.use(express.static('public'))

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})
app.use(express.json())

app.use(passport.initialize())
authMiddleware(passport)

app.get('/', (req, res) => {
	// #swagger.ignore = true
	res.sendFile(path.resolve(process.cwd(), './public/index.html'))
})
app.use(
	'/api-doc',
	swaggerUi.serve,
	swaggerUi.setup(swaggerFile, { customCssUrl: CSS_URL })
)
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/posts', postsRoutes)
app.use('/comments', commentsRoutes)

let db

async function run() {
	try {
		const conn = await client.connect()
		await client.db('admin').command({ ping: 1 })

		console.log('You successfully connected to MongoDB!')
		db = conn.db('practices')

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	} catch (error) {
		client.close()
		console.log(error)
	}
}
run()

export { db }
