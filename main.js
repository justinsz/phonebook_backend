require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('dist')) // Serve static files from dist folder
app.use(morgan('tiny'))

// Routes
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})

// New endpoint to find a person by name
app.get('/api/persons/name/:name', (req, res, next) => {
  const name = req.params.name
  Person.findOne({ name: name })
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log('Deleting person with ID:', id)
  
  Person.findByIdAndDelete(id)
    .then(result => {
      console.log('Delete result:', result)
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  console.log('Creating new person:', body)

  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  // First check if a person with this name already exists
  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        // Person exists, update their number
        console.log('Person exists, updating number')
        existingPerson.number = body.number
        return existingPerson.save()
      } else {
        // Create a new person
        const person = new Person({
          name: body.name,
          number: body.number,
        })
        return person.save()
      }
    })
    .then(savedPerson => {
      console.log('Person saved/updated:', savedPerson)
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  console.log('Updating person with ID:', req.params.id)
  console.log('New data:', { name, number })

  // Make sure we're not sending _id in the update
  const updateData = {
    name: name,
    number: number
  }

  Person.findByIdAndUpdate(
    req.params.id, 
    updateData, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      console.log('Updated person:', updatedPerson)
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).json({ error: 'person not found' })
      }
    })
    .catch(error => next(error))
})

// Info page
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      const infoHtml = `
        <div>
          <p>Phonebook has info for ${count} people</p>
          <p>${new Date()}</p>
        </div>
      `
      res.send(infoHtml)
    })
    .catch(error => next(error))
})

// For Render deployment - serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname })
})

// Unknown endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error('Error handler:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  next(error)
}

app.use(errorHandler)

// Define PORT
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})