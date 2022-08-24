const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://pukinuki:${password}@cluster0.wfrxug7.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    mongoose
        .connect(url)
        .then((result) => {

    const person = new Person({
      name: "Arto Hellas",
      number: "040-123456"
    })

      Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
      })
  })
  .catch((err) => console.log(err))
}
else if (process.argv.length<5) {
    console.log('Please provide a number as an argument: node mongo.js <password> <name> <number>')
    process.exit(1)
}
else {
    mongoose
    .connect(url)
    .then((result) => {

      const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
      })
  
      return person
                .save()
                .then((result) => {
                    console.log(`added ${result.name} ${result.number} to phonebook`)
                    return mongoose.connection.close()
                })
                .catch((err) => console.log(err))
  
    })
    .catch((err) => console.log(err))
}
