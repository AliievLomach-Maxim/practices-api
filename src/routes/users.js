import express from 'express'
import passport from 'passport'
import {
	getUsers,
	getUser,
	updateUser,
	addUser,
	deleteUser,
} from '../controllers/users.js'
import { addPost, getPostsByIdUser } from '../controllers/posts.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', passport.authenticate('jwt', { session: false }), updateUser)
router.post('/', passport.authenticate('jwt', { session: false }), addUser)
router.delete(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	deleteUser
)

router.get('/:id/posts', getPostsByIdUser)
router.post(
	'/:id/posts',
	passport.authenticate('jwt', { session: false }),
	addPost
)

export default router
