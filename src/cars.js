// import mongoClient
import { client } from './dbconnect.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

export const test = (req, res) => {
	res.json(`<h1>Test</h1>`)
}

export const getCars = (req, res) => {
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 10
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

export const addCar = (req, res) => {
	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const car = req.body
		if (Object.keys(car).length === 0) {
			res.status(400).json({ error: 'No data provided' })
			return
		}

		const saltRounds = 10
		const hashedPassword = bcrypt.hashSync(car.password, saltRounds)

		const collection = client.db('practices').collection('users')
		collection.insertOne(
			{ ...car, password: hashedPassword },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result) res.json(result)
				client.close()
			}
		)
	})
}

export const updateCar = (req, res) => {
	client.connect((err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const carId = req.params.id
		const car = req.body
		const collection = client.db('test').collection('cars')
		collection.updateOne(
			{ _id: ObjectId(carId) },
			{ $set: car },
			(err, result) => {
				if (err) res.status(500).send(err)
				if (result) res.json(result)
				client.close()
			}
		)
	})
}
