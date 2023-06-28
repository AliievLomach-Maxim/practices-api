export const handleBadRequest = (error, res) => {
	return res.status(400).json({
		errorMessage: 'Bad request',
		error: error.message,
	})
}
