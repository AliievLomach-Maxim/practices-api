import { Strategy as JwtStrategy } from 'passport-jwt'
import { ExtractJwt } from 'passport-jwt'
import { db } from '../../app.js'
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
		new JwtStrategy(options, async (payload, done) => {
			try {
				const collection = await db.collection('users')

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
	)
}
