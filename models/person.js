const mongoose = require('mongoose')

// Make sure this URL points to the phonebookApp database
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
    // Log the database and collections for debugging
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('Collections:', collections.map(c => c.name))
      })
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// This should create/use the 'people' collection
module.exports = mongoose.model('Person', personSchema) 