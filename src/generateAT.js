import jwt from 'jsonwebtoken'

export const generateAccessToken = (id, email) => {
	const payload = {
		userId: id,
		email: email,
	}
	return jwt.sign(payload, 'Hello', { expiresIn: '1h' })
}
