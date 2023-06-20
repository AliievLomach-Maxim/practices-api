import { ObjectId } from 'mongodb'
import { client } from '../config/dbconnect.js'

export const addPost = (req, res) => {
	const fieldDefinitions = [
		{ field: 'body', type: 'string', required: true },
		{ field: 'title', type: 'string', required: true },
	]
	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const missingFields = validateFields(req.body, fieldDefinitions)
		if (missingFields.length > 0) {
			return res
				.status(400)
				.json({ error: 'Validation errors', missingFields })
		}

		const userId = req.params.id
		const post = req.body
		if (Object.keys(post).length === 0) {
			res.status(400).json({ error: 'No data provided' })
			return
		}

		const collection = client.db('practices').collection('posts')
		collection.insertOne(
			{ ...post, userId: ObjectId(userId) },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result) res.json(result)
				client.close()
			}
		)
	})
}

export const getPosts = (req, res) => {
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 100

	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const collection = client.db('practices').collection('posts')
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
				.toArray((err, posts) => {
					if (err) res.status(500).send(err)
					if (posts) res.json({ posts, page, totalPages })
					client.close()
				})
		})
	})
}

export const getPost = (req, res) => {
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const { id } = req.params
		const collection = client.db('practices').collection('posts')
		try {
			const post = await collection.findOne({ _id: ObjectId(id) })
			if (!post) {
				return res.json({ message: 'Post not found' })
			}
			const collectionUsers = client.db('practices').collection('users')
			const user = await collectionUsers.findOne({
				_id: ObjectId(post.userId),
			})

			res.json({ ...post, userName: user.firstName })
			client.close()
		} catch (error) {
res.status(400).json({
	message: 'Some error...',
	error: error.message,
})
		}
	})
}

export const getPostsByIdUser = (req, res) => {
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const { id } = req.params
		const collection = client.db('practices').collection('posts')

		try {
			collection.find({ userId: id }).toArray((err, posts) => {
				if (err) res.status(500).json({ message: 'Posts not found' })
				if (posts) res.json({ posts })
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
