require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

morgan.token('body', function(req) {
    if (req.method === 'POST') 
        return JSON.stringify(req.body)
    return ''
})

const app = express()
const Person = require('./models/person')

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: "Malformatted id"})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

app.get("/api/persons", (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
})

app.get("/info", (request, response) => {
    Person.find({})
        .then(persons => {
            if (persons) {
                let times = new Date()
                response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
                response.write(`<p>${times}</p>`)
                response.end()
            } else {
                response.status(404).end()
            }
        })    
})

app.get("/api/persons/:id", (request, response, next) => {
    Person.find({_id: request.params.id})
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
    const body = request.body
    // console.log(body)

    // let err = null
    // if (!body.name) {
    //     err = 'name missing'
    // } else if (!body.number) {
    //     err = 'number missing'
    // }
    // //  else if (persons.find(p => p.name === body.name)) {
    // //     err = 'name must be unique'
    // // }

    // if (err) {
    //     return response.status(400).json({
    //         error: err
    //     })
    // }
    
    const newPerson = new Person({
        name: body.name,
        number: body.number,
    })
    newPerson.save()
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})