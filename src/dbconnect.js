import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

// const uri = process.env.URI
const uri =
	'mongodb+srv://alievlomachmaxim:v0h8346ri932RKx0@cluster0.4zcn3wh.mongodb.net/?retryWrites=true&w=majority'

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
