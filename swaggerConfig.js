import swaggerJsDoc from 'swagger-jsdoc'

const options = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Документация вашего API',
			version: '1.0.0',
			description: 'Документация API с использованием Swagger',
		},
	},
	apis: ['src/routes/*.js'], // Путь к файлам, содержащим описания маршрутов вашего API
}

const swaggerSpec = swaggerJsDoc(options)

export default swaggerSpec
