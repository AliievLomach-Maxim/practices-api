export const validateFields = (fields, fieldDefinitions) => {
	const validationErrors = []

	for (const fieldDefinition of fieldDefinitions) {
		const { field, type, required } = fieldDefinition
		const value = fields[field]

		if (
			required &&
			(value === null || value === undefined || value === '')
		) {
			validationErrors.push(`${field} is required`)
			continue
		}

		if (
			type &&
			value !== undefined &&
			value !== null &&
			typeof value !== type
		) {
			validationErrors.push(`Invalid data type. ${field} must be ${type}`)
		}
	}

	return validationErrors
}
