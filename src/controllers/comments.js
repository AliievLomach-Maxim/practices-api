import { ObjectId } from 'mongodb'
import { client } from '../config/dbconnect.js'
import { validateFields } from '../helpers/validateFields.js'

export const addComments = (req, res) => {
	const fieldDefinitions = [
		{ field: 'body', type: 'string', required: true },
		{ field: 'userId', type: 'string', required: true },
	]
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const postId = req.params.id
		const comment = req.body
		if (Object.keys(comment).length === 0) {
			res.status(400).json({ error: 'No data provided' })
			return
		}

		const missingFields = validateFields(req.body, fieldDefinitions)
		if (missingFields.length > 0) {
			return res
				.status(400)
				.json({ error: 'Validation errors', missingFields })
		}

		const collectionUsers = client.db('practices').collection('users')
		const user = await collectionUsers.findOne({
			_id: ObjectId(comment.userId),
		})
		delete comment.userId
		const creator = {
			firstName: user.firstName,
			lastName: user.lastName,
			image: user.image,
			userId: user._id,
		}
		const collection = client.db('practices').collection('comments')
		collection.insertOne({ ...comment, postId, creator }, (err, result) => {
			if (err) res.status(500).send(err)
			if (result) res.status(200).json({ message: 'Added successfully' })
			client.close()
		})
	})
}

export const getComments = (req, res) => {
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 100

	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const collection = client.db('practices').collection('comments')
		collection.countDocuments({}, (err, total) => {
			if (err) {
				res.status(500).json({ error: 'An error occurred' })
				return
			}
			const totalPages = Math.ceil(total / limit)
			const skip = (page - 1) * limit

			collection
				.find()
				.skip(skip)
				.limit(limit)
				.toArray((err, comments) => {
					if (err) res.status(500).send(err)
					if (comments) res.json({ comments, page, totalPages })
					client.close()
				})
		})
	})
}

export const getComment = (req, res) => {
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const { id } = req.params
		const collection = client.db('practices').collection('comments')
		try {
			const comment = await collection.findOne({ _id: ObjectId(id) })
			if (!comment) {
				return res.json({ message: 'Comment not found' })
			}

			res.json(comment)
			client.close()
		} catch (error) {
			res.status(400).json({ message: 'Some error...' })
		}
	})
}

export const getCommentsByIdPost = (req, res) => {
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const { id } = req.params
		const collection = client.db('practices').collection('comments')

		try {
			collection
				.find({ postId: ObjectId(id) })
				.toArray((err, comments) => {
					if (err) res.status(400).json({ message: err.message })
					if (comments) res.json({ comments })
					client.close()
				})
		} catch (error) {
			res.status(400).json({
				message: 'Some error...',
				error: error.message,
			})
		}
	})
}
