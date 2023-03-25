const mongoose = require('mongoose')

let argc = process.argv.length
if (argc !== 3 && argc !== 5) {
    console.log('Invalid arguments, require \'password [name number]\'')
    process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.cloknqc.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)


if (argc === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number
    })

    person.save().then(result => {
        console.log('added', result.name, 'number', result.number, 'to phonebook')
        mongoose.connection.close()
    })
}
else {
    Person
        .find({})
        .then(persons => {
            console.log('phonebook:')
            persons.forEach(p => {
                console.log(p.name, p.number)
            })
            mongoose.connection.close()
        })
}
