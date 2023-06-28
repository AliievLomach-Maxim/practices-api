import bcrypt from 'bcrypt'
import { client } from '../config/dbconnect.js'
import { generateAccessToken } from '../middleware/authMiddleware.js'
import { validateFields } from '../helpers/validateFields.js'
import { getRandomAvatar } from '../config/avatars.js'
import { handleBadRequest } from '../hendlers/badRequest.js'

export const login = (req, res) => {
	/* 
	#swagger.tags = ['Auth']
	#swagger.summary = 'Login'
	#swagger.description = 'Login'
	#swagger.parameters['body'] = {
		in: 'body',
		description: 'Login',
		schema: {
			email: 'example@example.com',
			password: 'password'
		}
	}
	#swagger.responses[200] = {
		description: 'Post successfully obtained.',
		schema: {
				token:'token',
				statusMessage: 'log in successfully',
				user: {$ref: '#/definitions/User' }
			}
    }
	#swagger.responses[403] = {
		description: 'Bad request',
		schema:
		{ error: 'Email or password error' }
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
		{ field: 'email', type: 'string', required: true },
		{ field: 'password', type: 'string', required: true },
	]
	client.connect(async (err) => {
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

		const { email, password } = req.body
		const collection = client.db('practices').collection('users')
		try {
			const user = await collection.findOne({ email })
			if (!user || !bcrypt.compareSync(password, user.password)) {
				return res
					.status(403)
					.json({ error: 'Email or password error' })
			}

			const token = generateAccessToken(user.userId, user.email)
			return res.json({
				token,
				user,
				statusMessage: 'Log in successfully',
			})
		} catch (error) {
			handleBadRequest(error, res)
			res.status(400).json({
				errorMessage: 'Bad request',
				error: error.message,
			})
		}
	})
}

export const signUp = (req, res) => {
	/* 
	#swagger.tags = ['Auth']
	#swagger.summary = 'Sign Up'
	#swagger.description = 'Sign Up'
	#swagger.parameters['body'] = {
		in: 'body',
		description: 'Login',
		schema: {
			firstName: 'Jhon Doe',
			email: 'example@example.com',
			password: 'password'
		}
	}
	
	#swagger.responses[200] = {
		description: 'User successfully obtained.',
		schema: 
			{ 
				statusMessage: 'sign up successfully',
				token:'token',
				user: {$ref: '#/definitions/User' }
			}
    }
	#swagger.responses[403] = {
		description: 'User with this email already exists',
		schema:
			{ error: 'User with this email already exists' }
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

			const collection = client.db('practices').collection('users')

			const existingUser = await collection.findOne({ email: user.email })
			if (existingUser) {
				return res
					.status(403)
					.json({ error: 'User with this email already exists' })
			}

			const insertResult = await collection.insertOne(newUser)

			const userData = await collection.findOne({
				_id: insertResult.insertedId,
			})

			const token = generateAccessToken(userData.userId, userData.email)

			return res.json({
				statusMessage: 'sign up successfully',
				token,
				user: userData,
			})
		})
	} catch (err) {
		res.status(500).send(err)
	} finally {
		client.close()
	}
}
