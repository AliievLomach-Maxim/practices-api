import { uri } from '../secret.js'
import { MongoClient, ServerApiVersion } from 'mongodb'

export const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
})

async function run() {
	try {
		await client.connect()
		await client.db('admin').command({ ping: 1 })
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		)
	} finally {
		await client.close()
	}
}
run().catch(console.dir)
