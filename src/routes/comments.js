import express from 'express'
import passport from 'passport'
import {
	addComments,
	getComments,
	getComment,
	deleteComment,
} from '../controllers/comments.js'

const router = express.Router()

router.get('/', getComments)
router.get('/:id', getComment)
router.post(
	'/add/:id',
	passport.authenticate('jwt', { session: false }),
	addComments
)
router.delete(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	deleteComment
)

export default router
