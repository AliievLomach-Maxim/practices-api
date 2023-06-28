import { client } from '../config/dbconnect.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import { getRandomAvatar } from '../config/avatars.js'
import { validateFields } from '../helpers/validateFields.js'
import { handleBadRequest } from '../hendlers/badRequest.js'

export const getUsers = (req, res) => {
	/* 
	#swagger.tags = ['Users']
	#swagger.summary = 'Get All users'
	#swagger.description = 'Get All users'
	#swagger.responses[200] = {
		description: 'User successfully obtained.',
		schema: { $ref: '#/definitions/Users' }
    } */
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 100

	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const collection = client.db('practices').collection('users')
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
				.toArray((err, users) => {
					if (err) res.status(500).send(err)
					if (users) res.json({ users, page, totalPages, total })
					client.close()
				})
		})
	})
}

export const getUser = (req, res) => {
	/* 
	#swagger.tags = ['Users']
	#swagger.summary = 'Get user'
	#swagger.description = 'Get user'
	#swagger.responses[200] = {
		description: 'User successfully obtained.',
		schema: { $ref: '#/definitions/User' }
    }
	#swagger.responses[404] = {
		description: 'User not found',
		schema:
			{
				message: 'User not found'
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
		const collection = client.db('practices').collection('users')
		try {
			const user = await collection.findOne({ _id: ObjectId(id) })

			if (!user) {
				return res.status(404).json({ message: 'User not found' })
			}

			res.json(user)
			client.close()
		} catch (error) {
			handleBadRequest(error, res)
		}
	})
}

export const addUser = (req, res) => {
	/* 
	#swagger.tags = ['Users']
	#swagger.summary = 'Create user'
	#swagger.description = 'Create user'
	#swagger.security = [{
               "bearerAuth": []
        }] 
	#swagger.parameters['body'] = {
		in: 'body',
		required: true,
		description: 'Adding new user.',
		schema: {
			firstName: 'Terry',
			lastName: 'Medhurst',
			gender: { '@enum': ['male', 'female', 'other'] },
			email: 'example@example.com',
			phone: '+63 791 675 8914',
			image: 'https://example.org/example.png',
			password: 'password'
		}
	}
	#swagger.responses[401] = {
		description: 'Unauthorized',
    }
	#swagger.responses[200] = {
		description: 'User successfully obtained.',
		schema: 
		{
				message: 'Create user successfully'
			}
    }
	#swagger.responses[403] = {
		description: 'User with this email already exists',
		schema:
			{
				message: 'User with this email already exists'
			}
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
		{ field: 'firstName', type: 'string', required: true },
		{ field: 'email', type: 'string', required: true },
		{ field: 'password', type: 'string', required: true },
	]

	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const user = req.body
		if (Object.keys(user).length === 0) {
			res.status(400).json({ error: 'No data provided' })
			return
		}

		const missingFields = validateFields(req.body, fieldDefinitions)
		if (missingFields.length > 0) {
			return res
				.status(400)
				.json({ error: 'Validation errors', missingFields })
		}

		const collection = client.db('practices').collection('users')
		const existingUser = await collection.findOne({ email: user.email })
		if (existingUser) {
			return res
				.status(403)
				.json({ error: 'User with this email already exists' })
		}

		const saltRounds = 10
		const hashedPassword = bcrypt.hashSync(user.password, saltRounds)

		const newUser = {
			lastName: undefined,
			gender: undefined,
			phone: undefined,
			image: getRandomAvatar(),
			...user,
			password: hashedPassword,
		}

		collection.insertOne(newUser, (err, result) => {
			if (err) res.status(500).send(err)
			if (result)
				res.json({
					message: 'Create user successfully',
				})
			client.close()
		})
	})
}

export const updateUser = (req, res) => {
	/* 
	#swagger.tags = ['Users']
	#swagger.summary = 'Update user'
	#swagger.description = 'Update user'
	#swagger.security = [{
               "bearerAuth": []
        }] 
	#swagger.parameters['body'] = {
		in: 'body',
		required: true,
		description: 'Adding new user.',
		schema: {
			firstName: 'Terry',
			lastName: 'Medhurst',
			gender: { '@enum': ['male', 'female', 'other'] },
			email: 'example@example.com',
			phone: '+63 791 675 8914',
			image: 'https://example.org/example.png',
		}
	}
	#swagger.responses[401] = {
		description: 'Unauthorized',
    }
	#swagger.responses[200] = {
		description: 'User successfully obtained.',
		schema: {
				message: 'Update user successfully'
			}
    }
	#swagger.responses[403] = {
		description: 'User with this email already exists',
		schema:
			{
				message: 'User with this email already exists'
			}
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
		{ field: 'firstName', type: 'string', required: false },
		{ field: 'email', type: 'string', required: false },
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
		if (req.body.password) {
			return res.status(400).json({
				error: 'Validation errors',
				message: 'Password cannot be changed',
			})
		}
		if (req.body.email) {
			return res.status(400).json({
				error: 'Validation errors',
				message: 'Email cannot be changed',
			})
		}

		const collection = client.db('practices').collection('users')
		collection.updateOne(
			{ _id: ObjectId(req.params.id) },
			{ $set: req.body },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result)
					res.json({
						message: 'Update user successfully',
					})
				client.close()
			}
		)
	})
}

export const deleteUser = (req, res) => {
	/* 
  #swagger.tags = ['Users']
  #swagger.summary = 'Delete user'
  #swagger.description = 'Delete user'
  #swagger.security = [{
    "bearerAuth": []
  }] 
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'User ID',
    required: true,
    type: 'string'
  }
  #swagger.responses[401] = {
    description: 'Unauthorized',
  }
  #swagger.responses[200] = {
    description: 'User successfully deleted.',
    schema: {
      message: 'User deleted successfully'
    }
  }
  #swagger.responses[404] = {
    description: 'User not found',
    schema: {
      message: 'User not found'
    }
  } 
  */

	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}

		const collection = client.db('practices').collection('users')
		collection.deleteOne(
			{ _id: ObjectId(req.params.id) },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result.deletedCount === 0) {
					res.status(404).json({
						message: 'User not found',
					})
				} else {
					res.json({
						message: 'User deleted successfully',
					})
				}
				client.close()
			}
		)
	})
}
