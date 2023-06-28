import { ObjectId } from 'mongodb'
import { client } from '../config/dbconnect.js'
import { validateFields } from '../helpers/validateFields.js'
import { handleBadRequest } from '../hendlers/badRequest.js'

export const addComments = (req, res) => {
	/* 
	#swagger.tags = ['Comments']
	#swagger.summary = 'Create comment'
	#swagger.description = 'Create comment'
	#swagger.security = [{
               "bearerAuth": []
        }] 
	#swagger.parameters['body'] = {
		in: 'body',
		required: true,
		description: 'Adding new comment.',
		schema: {
			body: 'text comment',
			userId: 'user ID'
		}
	}
	#swagger.responses[401] = {
		description: 'Unauthorized',
    }
	#swagger.responses[200] = {
		description: 'Comment successfully obtained.',
		schema:{ message: 'Added successfully' }
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
	/* 
	#swagger.tags = ['Comments']
	#swagger.summary = 'Get All comments'
	#swagger.description = 'Get All comments'
	
	#swagger.responses[200] = {
		description: 'Comments successfully obtained.',
		schema:{ $ref: '#/definitions/Comments' }
    }
	*/
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
	/* 
	#swagger.tags = ['Comments']
	#swagger.summary = 'Get comment'
	#swagger.description = 'Get comment'

	#swagger.responses[200] = {
		description: 'Comment successfully obtained.',
		schema:{ $ref: '#/definitions/Comment' }
    }

	#swagger.responses[404] = {
		description: 'Comment not found',
		schema:{ message: 'Comment not found' }
    }
	*/
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
				return res.status(404).json({ message: 'Comment not found' })
			}

			res.json(comment)
			client.close()
		} catch (error) {
			handleBadRequest(error, res)
		}
	})
}

export const getCommentsByIdPost = (req, res) => {
	/* 
	#swagger.tags = ['Comments']
	#swagger.summary = 'Get All comments by Post ID '
	#swagger.description = 'Get All comments by Post ID '

	#swagger.parameters['id'] = {
		in: 'path',
		description: 'Post ID',
		required: true,
		type: 'string'
	}
	#swagger.responses[200] = {
		description: 'Post Comments obtained.',
		schema:{ $ref: '#/definitions/CommentsByIdPost' }
    }
	*/
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
			handleBadRequest(error, res)
		}
	})
}

export const deleteComment = (req, res) => {
	/*
  #swagger.tags = ['Comments']
  #swagger.summary = 'Delete comment'
  #swagger.description = 'Delete comment'
  #swagger.security = [{
           "bearerAuth": []
    }]
  #swagger.parameters['commentId'] = {
    in: 'path',
    required: true,
    description: 'ID of the comment to delete',
    type: 'string'
  }
  #swagger.responses[401] = {
    description: 'Unauthorized',
  }
  #swagger.responses[200] = {
    description: 'Comment successfully deleted.',
    schema: { message: 'Deleted successfully' }
  }
  #swagger.responses[404] = {
    description: 'Comment not found',
    schema: { message: 'Comment not found' }
  }
  */

	const commentId = req.params.commentId

	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const collection = client.db('practices').collection('comments')

		const result = await collection.deleteOne({ _id: ObjectId(commentId) })

		if (result.deletedCount === 1) {
			res.status(200).json({ message: 'Deleted successfully' })
		} else {
			res.status(404).json({ message: 'Comment not found' })
		}

		client.close()
	})
}
