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

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

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
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
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

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})