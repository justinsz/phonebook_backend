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
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  console.log('Deleting person with ID:', req.params.id)
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      console.log('Delete result:', result)
      res.status(204).end()
    })
    .catch(error => {
      console.error('Error deleting person:', error)
      next(error)
    })
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  console.log('Creating new person:', body)
  
  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'name or number missing' 
    })
  }
  
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  
  person.save()
    .then(savedPerson => {
      console.log('Person saved:', savedPerson)
      res.json(savedPerson)
    })
    .catch(error => {
      console.error('Error saving person:', error)
      next(error)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  console.log('Updating person with ID:', req.params.id, { name, number })
  
  Person.findByIdAndUpdate(
    req.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      console.log('Update result:', updatedPerson)
      res.json(updatedPerson)
    })
    .catch(error => {
      console.error('Error updating person:', error)
      next(error)
    })
})

// Info page
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error))
})

// For Render deployment - serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname })
})

// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error('Error handler:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// Define PORT
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})