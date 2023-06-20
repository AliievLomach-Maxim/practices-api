import { client } from '../config/dbconnect.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import { getRandomAvatar } from '../config/avatars.js'

export const getUsers = (req, res) => {
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
				.toArray((err, result) => {
					if (err) res.status(500).send(err)
					if (result) res.json({ result, page, totalPages })
					client.close()
				})
		})
	})
}

export const getUser = (req, res) => {
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
				return res.json({ message: 'User not found' })
			}

			res.json(user)
			client.close()
		} catch (error) {
			res.status(400).json({
				message: 'Some error...',
				error: error.message,
			})
		}
	})
}

export const addUser = (req, res) => {
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
			if (result) res.json(result)
			client.close()
		})
	})
}

export const updateUser = (req, res) => {
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
			return res
				.status(400)
				.json({
					error: 'Validation errors',
					message: 'Password cannot be changed',
				})
		}

		const collection = client.db('practices').collection('users')
		collection.updateOne(
			{ _id: ObjectId(req.params.id) },
			{ $set: req.body },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result) res.json(result)
				client.close()
			}
		)
	})
}
