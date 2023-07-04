import { db } from '../config/dbconnect.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import { getRandomAvatar } from '../config/avatars.js'
import { validateFields } from '../helpers/validateFields.js'
import { handleBadRequest } from '../hendlers/badRequest.js'

export const getUsers = async (req, res) => {
	/* 
  #swagger.tags = ['Users']
  #swagger.summary = 'Get All users'
  #swagger.description = 'Get All users'
  #swagger.parameters['name'] = {
    in: 'query',
    description: 'Search by user first name',
    type: 'string'
  }
  #swagger.parameters['page'] = {
    in: 'query',
    description: 'Page number',
    type: 'integer'
  }
  #swagger.parameters['limit'] = {
    in: 'query',
    description: 'Number of items per page',
    type: 'integer'
  }
  #swagger.responses[200] = {
    description: 'User successfully obtained.',
    schema: { $ref: '#/definitions/Users' }
  } */
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 100
	const firstName = req.query.name || ''
	try {
		const collection = await db.collection('users')

		const query = firstName
			? { firstName: { $regex: firstName, $options: 'i' } }
			: {}

		const total = await collection.countDocuments(query)
		const totalPages = Math.ceil(total / limit)
		const skip = (page - 1) * limit

		const users = await collection
			.find(query)
			.skip(skip)
			.limit(limit)
			.toArray()

		res.json({ users, page, totalPages, total })
	} catch (error) {
		handleBadRequest(error, res)
	}
}

export const getUser = async (req, res) => {
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
	try {
		const { id } = req.params
		const collection = await db.collection('users')

		const user = await collection.findOne({ _id: ObjectId(id) })

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		res.json(user)
	} catch (error) {
		handleBadRequest(error, res)
	}
}

export const addUser = async (req, res) => {
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

	try {
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

		const collection = await db.collection('users')

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

		await collection.insertOne(newUser)
		res.json({
			message: 'Create user successfully',
		})
	} catch (error) {
		handleBadRequest(error, res)
	}
}

export const updateUser = async (req, res) => {
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
	try {
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

		const collection = await db.collection('users')

		const result = await collection.updateOne(
			{ _id: ObjectId(req.params.id) },
			{ $set: req.body }
		)

		if (result.modifiedCount > 0) {
			const user = await collection.findOne({
				_id: ObjectId(req.params.id),
			})

			res.json(user)
		} else {
			res.status(400).json({
				error: 'Validation errors',
				message: 'User not found or no changes applied',
			})
		}
	} catch (error) {
		handleBadRequest(error, res)
	}
}

export const deleteUser = async (req, res) => {
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

	try {
		const collection = await db.collection('users')

		const result = await collection.deleteOne({
			_id: ObjectId(req.params.id),
		})

		if (result.deletedCount === 0) {
			res.status(404).json({
				message: 'User not found',
			})
		} else {
			res.json({
				message: 'User deleted successfully',
			})
		}
	} catch (error) {
		handleBadRequest(error, res)
	}
}
