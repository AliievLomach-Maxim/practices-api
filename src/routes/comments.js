import express from 'express'
import passport from 'passport'
import {
	addComments,
	getComments,
	getComment,
} from '../controllers/comments.js'

const router = express.Router()

router.get('/', getComments)
router.get('/:id', getComment)
router.post(
	'/add/:id',
	passport.authenticate('jwt', { session: false }),
	addComments
)

export default router
