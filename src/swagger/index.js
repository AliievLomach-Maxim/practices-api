import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import swaggerAutogen from 'swagger-autogen'

const _dirname = dirname(fileURLToPath(import.meta.url))

const doc = {
	info: {
		title: 'Practices - API Documentation',
		version: '1.0.0',
		description: 'API documentation using Swagger',
	},
	securityDefinitions: {
		bearerAuth: {
			type: 'apiKey',
			in: 'header',
			name: 'Authorization',
			description: 'Bearer token authorization',
		},
	},
	definitions: {
		User: {
			_id: '648edfa104490fd490173125',
			firstName: 'Terry',
			lastName: 'Medhurst',
			gender: { '@enum': ['male', 'female', 'other'] },
			email: 'example@example.com',
			phone: '+63 791 675 8914',
			image: 'https://example.org/example.png',
			password: 'string',
		},
		Users: {
			users: [
				{
					$ref: '#/definitions/User',
				},
			],
			page: 0,
			totalPages: 0,
			total: 0,
		},
		Post: {
			_id: '648f037fbcec46ba8e03dd75',
			title: 'His mother had always taught him',
			body: 'His mother had always taught him not to ever think ...',
			userId: '649151c2a5a13144c3ed7c68',
		},
		Posts: {
			posts: [
				{
					$ref: '#/definitions/Post',
				},
			],
			page: 0,
			totalPages: 0,
			total: 0,
		},
		PostsByUserId: {
			posts: [
				{
					$ref: '#/definitions/Post',
				},
			],
		},
		Comment: {
			id: '648f37ef979165668fdf8d18',
			body: 'TEST',
			postId: '648f037fbcec46ba8e03dd75',
			creator: {
				firstName: 'Mercedes',
				lastName: 'null',
				image: 'null',
				userId: '648ef02a90dd4510355d5718',
			},
		},
		Comments: {
			comments: [
				{
					$ref: '#/definitions/Comment',
				},
			],
			page: 0,
			totalPages: 0,
			total: 0,
		},
		CommentsByIdPost: {
			comments: [
				{
					$ref: '#/definitions/Comment',
				},
			],
		},
	},
	host: 'localhost:3333',
	schemes: ['http'],
}

const outputFile = join(_dirname, 'output.json')

const endpointsFiles = [join(_dirname, '../../app.js')]

swaggerAutogen(outputFile, endpointsFiles, doc).then(({ success }) => {
	console.log(`Generated: ${success}`)
})
