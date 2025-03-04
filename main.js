const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('dist')) // Serve static files from dist folder
app.use(morgan('tiny'))

// Get data from a file for now
let persons = [
  { name: 'Arto Hellas', number: '040-123456', id: '1' },
  { name: 'Ada Lovelace', number: '39-44-5323523', id: '2' },
  { name: 'Dan Abramov', number: '12-43-234345', id: '3' },
  { name: 'Mary Poppendieck', number: '39-23-6423122', id: '4' }
]

// Routes
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(person => person.id === id)
  
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(person => person.id !== id)
  
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'name or number missing' 
    })
  }
  
  if (persons.find(person => person.name === body.name)) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  
  const person = {
    name: body.name,
    number: body.number,
    id: Math.random().toString(36).substr(2, 9)
  }
  
  persons = persons.concat(person)
  
  res.json(person)
})

app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'name or number missing' 
    })
  }
  
  const person = {
    name: body.name,
    number: body.number,
    id: id
  }
  
  const index = persons.findIndex(p => p.id === id)
  if (index !== -1) {
    persons[index] = person
    res.json(person)
  } else {
    res.status(404).end()
  }
})

// Info page
app.get('/info', (req, res) => {
  res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `)
})

// For Render deployment - serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname })
})

// Define PORT
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})