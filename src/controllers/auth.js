import bcrypt from 'bcrypt'
import { db } from '../../app.js'
import { generateAccessToken } from '../middleware/authMiddleware.js'
import { validateFields } from '../helpers/validateFields.js'
import { getRandomAvatar } from '../config/avatars.js'
import { handleBadRequest } from '../hendlers/badRequest.js'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
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
	try {
		const missingFields = validateFields(req.body, fieldDefinitions)
		if (missingFields.length > 0) {
			return res
				.status(400)
				.json({ error: 'Validation errors', missingFields })
		}

		const { email, password } = req.body

		const collection = await db.collection('users')

		const user = await collection.findOne({ email })
		if (!user || !bcrypt.compareSync(password, user.password)) {
			return res.status(403).json({ error: 'Email or password error' })
		}

		const token = generateAccessToken(user.userId, user.email)
		return res.json({
			token,
			user,
			statusMessage: 'Log in successfully',
		})
	} catch (error) {
		handleBadRequest(error, res)
	}
}

export const signUp = async (req, res) => {
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
		const user = req.body
		if (Object.keys(user).length === 0) {
			return res.status(400).json({ error: 'No data provided' })
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

		const collection = await db.collection('users')

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
	} catch (err) {
		res.status(500).send(err)
	}
}

export const refreshToken = async (req, res) => {
	/* 
  #swagger.tags = ['Auth']
  #swagger.summary = 'Refresh Token'
  #swagger.description = 'Refreshes the access token'
  #swagger.responses[200] = {
    description: 'Token successfully refreshed.',
    schema: {
      token: 'new_token',
      statusMessage: 'refresh successfully',
      user: {$ref: '#/definitions/User'}
    }
  }
  #swagger.responses[400] = {
    description: 'Invalid Token',
    schema: {
      error: 'Invalid Token'
    }
  }
  #swagger.responses[500] = {
    description: 'Server error',
    schema: {
      error: 'Server error'
    }
  }
 	#swagger.security = [{
               "bearerAuth": []
        }] 
  */
	const authorizationHeader = req.headers.authorization

	if (!authorizationHeader) {
		return res.status(401).json({ error: 'Authorization header missing' })
	}

	try {
		const token = authorizationHeader.split(' ')[1]

		const email = getUserEmailFromToken(authorizationHeader)

		const collection = await db.collection('users')

		const user = await collection.findOne({ email })
		if (!user) {
			return res.status(401).json({ error: 'Invalid token' })
		}

		const newToken = generateAccessToken(user.userId, email)

		return res.json({
			token: newToken,
			statusMessage: 'refresh successfully',
			user,
		})
	} catch (error) {
		console.log('error :>> ', error.message)
		return error.message === 'jwt expired'
			? res.status(400).json({ error: 'Invalid Token' })
			: res.status(500).json({ error: 'Server error' })
	}
}

const getUserEmailFromToken = (authorizationHeader) => {
	const token = authorizationHeader.split(' ')[1]
	const decodedToken = jwt.verify(token, 'Hello')
	const userEmail = decodedToken.email

	return userEmail
}
