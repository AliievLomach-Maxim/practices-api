import express from 'express'
import cors from 'cors'
import passport from 'passport'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'

import usersRoutes from './src/routes/users.js'
import authRoutes from './src/routes/auth.js'
import postsRoutes from './src/routes/posts.js'
import commentsRoutes from './src/routes/comments.js'
import authMiddleware from './src/middleware/authMiddleware.js'

const PORT = process.env.PORT || 3333

const swaggerFilePath = path.resolve(process.cwd(), './src/swagger/output.json')
const swaggerFile = JSON.parse(fs.readFileSync(swaggerFilePath))

const app = express()

const CSS_URL =
	'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css'

// app.use(cors())
// app.options('*', cors())
app.use(express.json())

app.use(passport.initialize())
authMiddleware(passport)

app.use(
	'/api-doc',
	swaggerUi.serve,
	swaggerUi.setup(swaggerFile, { customCssUrl: CSS_URL })
)

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/posts', postsRoutes)
app.use('/comments', commentsRoutes)

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
