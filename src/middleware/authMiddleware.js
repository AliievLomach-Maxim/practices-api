import { Strategy as JwtStrategy } from 'passport-jwt'
import { ExtractJwt } from 'passport-jwt'
import { client } from '../config/dbconnect.js'
import jwt from 'jsonwebtoken'

export const generateAccessToken = (id, email) => {
	const payload = {
		userId: id,
		email: email,
	}
	return jwt.sign(payload, 'Hello', { expiresIn: '1d' })
}

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: 'Hello',
}

export default (passport) => {
	passport.use(
		new JwtStrategy(options, (payload, done) => {
			client.connect(async (err) => {
				if (err) {
					res.status(500).send(err)
					return
				}
				try {
					const collection = client
						.db('practices')
						.collection('users')

					const user = await collection.findOne({
						userId: payload.userId,
					})

					if (user) {
						done(null, user)
					} else {
						done(null, false)
					}
				} catch (e) {
					console.log(e)
				}
			})
		})
	)
}
