import express from 'express'
import cors from 'cors'
import passport from 'passport'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'

import usersRoutes from './src/routes/users.js'
import authRoutes from './src/routes/auth.js'
import postsRoutes from './src/routes/posts.js'
import commentsRoutes from './src/routes/comments.js'
import authMiddleware from './src/middleware/authMiddleware.js'

const PORT = process.env.PORT || 3333
const swaggerFile = JSON.parse(fs.readFileSync('./swagger/output.json'))
const app = express()

app.use(cors())
app.options('*', cors())
app.use(express.json())

app.use(passport.initialize())
authMiddleware(passport)

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/posts', postsRoutes)
app.use('/comments', commentsRoutes)

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
