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
    let times = new Date()
    // console.log(times)
    response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
    response.write(`<p>${times}</p>`)
    response.end()
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete("/api/persons/:id", (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            console.log(error)
            response.status(500).end()
        })
})

app.post("/api/persons", (request, response) => {
    const body = request.body
    // console.log(body)

    let err = null
    if (!body.name) {
        err = 'name missing'
    } else if (!body.number) {
        err = 'number missing'
    }
    //  else if (persons.find(p => p.name === body.name)) {
    //     err = 'name must be unique'
    // }

    if (err) {
        return response.status(400).json({
            error: err
        })
    }
    
    const newPerson = new Person({
        name: body.name,
        number: body.number,
    })
    newPerson.save()
        .then(result => {
            response.json(result)
        })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})