import { generateAccessToken } from './generateAT.js'
import { client } from './dbconnect.js'
import bcrypt from 'bcrypt'

export const login = (req, res) => {
	client.connect(async (err) => {
		if (err) {
			res.status(500).send(err)
			return
		}
		const { email, password } = req.body
		const collection = client.db('practices').collection('users')
		try {
			const user = await collection.findOne({ email })

			if (!user) {
				return res.json({ message: 'Email error', code: 2 })
			}
			const validPassword = bcrypt.compareSync(password, user.password)
			if (!validPassword) {
				return res.json({ message: 'Password error', code: 2 })
			}
			const token = generateAccessToken(user.userId, user.email)
			return res.json({ token })
		} catch (error) {
			res.status(400).json({ message: 'Login error' })
		}
	})
}
