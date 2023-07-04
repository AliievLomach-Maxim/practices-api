import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

export const client = new MongoClient(process.env.URI, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
})

let db

async function run() {
	try {
		const conn = await client.connect()
		await client.db('admin').command({ ping: 1 })

		console.log('You successfully connected to MongoDB!')
		db = conn.db('practices')
	} catch (error) {
		client.close()
		console.log(error)
	}
}
run()

export { db }
