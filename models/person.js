const mongoose = require('mongoose')

// Make sure this URL points to the phonebookApp database
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
    // Log the database and collections for debugging
    mongoose.connection.db.listCollections().toArray()
      .then((collections) => {
        console.log('Collections:', collections.map((c) => c.name))
      })
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long'],
    required: [true, 'Name is required'],
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator(v) {
        // Phone number validation:
        // - Must be at least 8 characters
        // - Must have format: 2-3 digits, hyphen, rest of the numbers
        return /^(\d{2,3})-(\d+)$/.test(v) && v.length >= 8
      },
      message: (props) => `${props.value} is not a valid phone number! Format should be XX-XXXXXXX or XXX-XXXXXXX with at least 8 characters total.`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

// This should create/use the 'people' collection
module.exports = mongoose.model('Person', personSchema) 