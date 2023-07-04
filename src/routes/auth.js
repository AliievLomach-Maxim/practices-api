import express from 'express'
import { login, refreshToken, signUp } from '../controllers/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signUp)
router.get('/refresh', refreshToken)

export default router
