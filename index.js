require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan('tiny'))

app.get('/api/persons', (request, response, next) => {
  Person
    .find({}).then(persons => {
      response.json(persons)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (request, response, next) => {
  Person
    .count({}).then(count => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>
        <p>${new Date().toString()}</p>`)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request,response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

morgan.token('jsonBody', (req) => {
  if (Object.keys(req.body).length>0)
    return JSON.stringify(req.body)
  else
    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :jsonBody'))

app.post('/api/persons', (request, response, next) => {

  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person
    .find({ name: body.name }).then(result => {
      if (result.length!==0) {
        return response.status(409).json({
          error: `person ${body.name} is already in the database`,
          person: result[0]
        })
      }
      else {
        const person = new Person(
          {
            name: body.name,
            number: body.number
          }
        )

        return person
          .save()
          .then((result) => {
            console.log(`added ${result.name} ${result.number} to phonebook`)
            response.json(result)
          })
          .catch(error => next(error))
      }
    })
    .catch(error => {
      next(error)
    })

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      updatedPerson.number = person.number
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.name,error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

