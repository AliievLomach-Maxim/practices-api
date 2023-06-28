import express from 'express'
import passport from 'passport'
import { getPosts, getPost, deletePost } from '../controllers/posts.js'
import { getCommentsByIdPost } from '../controllers/comments.js'

const router = express.Router()

router.get('/', getPosts)
router.get('/:id', getPost)
router.get('/:id/comments', getCommentsByIdPost)
router.delete(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	deletePost
)

export default router
