import bcrypt from 'bcrypt'
import { client } from '../config/dbconnect.js'
import { generateAccessToken } from '../middleware/authMiddleware.js'
import { validateFields } from '../helpers/validateFields.js'
import { getRandomAvatar } from '../config/avatars.js'

export const login = (req, res) => {
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
			if (!user) {
				return res.json({ error: 'Email or password error' })
			}

			const validPassword = bcrypt.compareSync(password, user.password)
			if (!validPassword) {
				return res.json({ error: 'Email or password error' })
			}

			const token = generateAccessToken(user.userId, user.email)
			return res.json({
				token,
				statusCode: 200,
				statusMessage: 'log in successfully',
			})
		} catch (error) {
			res.status(400).json({
				errorMessage: 'Some error...',
				error: error.message,
			})
		}
	})
}

export const signUp = (req, res) => {
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
				statusCode: 200,
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
