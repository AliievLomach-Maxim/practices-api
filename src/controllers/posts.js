import { ObjectId } from 'mongodb'
import { client } from '../config/dbconnect.js'
import { handleBadRequest } from '../hendlers/badRequest.js'

export const addPost = (req, res) => {
	/* 
	#swagger.tags = ['Posts']
	#swagger.summary = 'Create post'
	#swagger.description = 'Create post'
	#swagger.security = [{
               "bearerAuth": []
        }] 
	#swagger.parameters['id'] = {
		in: 'path',
		description: 'User ID',
		required: true,
		type: 'string'
	}
	#swagger.parameters['body'] = {
		in: 'body',
    	required: true,
		description: 'Adding new post.',
		schema: {
			body: 'text post',
			title: 'title post'
		}
	}
	#swagger.responses[401] = {
		description: 'Unauthorized',
    }
	#swagger.responses[200] = {
		description: 'Post successfully obtained.',
		schema: { message: 'Post added successfully', }
    }
	#swagger.responses[400] = {
		description: 'Bad request',
		schema:
		{
			error: 'Validation errors', 
			missingFields:['missingFields'] 
		}
    } 
	*/
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
				if (result) res.json({ message: 'Post added successfully' })
				client.close()
			}
		)
	})
}

export const getPosts = (req, res) => {
	/* 
	#swagger.tags = ['Posts']
	#swagger.summary = 'Get All posts'
	#swagger.description = 'Get All posts'
	#swagger.responses[200] = {
		description: 'Post successfully obtained.',
		schema: { $ref: '#/definitions/Posts' }
    }
	*/
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
	/* 
	#swagger.tags = ['Posts']
	#swagger.summary = 'Get post'
	#swagger.description = 'Get post'
	#swagger.responses[200] = {
		description: 'Post successfully obtained.',
		schema: { $ref: '#/definitions/Post' }
    }
	#swagger.responses[404] = {
		description: 'Post not found',
		schema:
			{
				message: 'Post not found'
			}
    } 
	#swagger.responses[400] = {
		description: 'Bad request',
		schema:
			{
				message: 'Bad request',
				error: 'errorMessage'
			}
    } 
	*/
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
				return res.status(404).json({ message: 'Post not found' })
			}
			const collectionUsers = client.db('practices').collection('users')
			const user = await collectionUsers.findOne({
				_id: ObjectId(post.userId),
			})

			res.json({ ...post, userName: user.firstName })
			client.close()
		} catch (error) {
			handleBadRequest(error, res)
		}
	})
}

export const getPostsByIdUser = (req, res) => {
	/* 
	#swagger.tags = ['Posts']
	#swagger.summary = 'Get All posts by ID User'
	#swagger.description = 'Get All posts by ID User'

	#swagger.responses[200] = {
		description: 'Post successfully obtained.',
		schema: { $ref: '#/definitions/PostsByUserId' }
    }
	#swagger.responses[404] = {
		description: 'Posts not found',
		schema:
			{
				message: 'Posts not found'
			}
    } 
	#swagger.responses[400] = {
		description: 'Bad request',
		schema:
			{
				message: 'Bad request',
				error: 'errorMessage'
			}
    } 
	*/
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const { id } = req.params
		const collection = client.db('practices').collection('posts')

		try {
			collection.find({ userId: id }).toArray((err, posts) => {
				if (err) res.status(404).json({ message: 'Posts not found' })
				if (posts) res.json({ posts })
				client.close()
			})
		} catch (error) {
			handleBadRequest(error, res)
		}
	})
}

export const deletePost = (req, res) => {
	/* 
  #swagger.tags = ['Posts']
  #swagger.summary = 'Delete post'
  #swagger.description = 'Delete post'
  #swagger.security = [{
    "bearerAuth": []
  }] 
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'Post ID',
    required: true,
    type: 'string'
  }
  #swagger.responses[401] = {
    description: 'Unauthorized',
  }
  #swagger.responses[200] = {
    description: 'Post successfully deleted.',
    schema: {
      message: 'Post deleted successfully'
    }
  }
  #swagger.responses[404] = {
    description: 'Post not found',
    schema: {
      message: 'Post not found'
    }
  } 
  */

	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const collection = client.db('practices').collection('posts')
		collection.deleteOne(
			{ _id: ObjectId(req.params.id) },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result.deletedCount === 0) {
					res.status(404).json({
						message: 'Post not found',
					})
				} else {
					res.json({
						message: 'Post deleted successfully',
					})
				}
				client.close()
			}
		)
	})
}
