const express = require('express')
const app = express()
const path = require('path')
const port = 4000
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
// const studentList = fs.createReadStream('./data/students.json')



const mongoose = require('mongoose');
const dbConnectionString= 'mongodb://localhost:27017/userManager'; 
mongoose.connect(dbConnectionString, {useNewUrlParser: true,useUnifiedTopology: true,}); 
const db = mongoose.connection; //connecting to the Database


const userSchema = new mongoose.Schema({

    full_name: String,
    id: mongoose.Mixed,
    age: { type: Number, min: 1, max: 99 },
    email: String,
});

const User = mongoose.model('Users', userSchema)

db.on('error', (err) => {
    console.log(err)
})

db.on('connecting', () => console.log('Connecting'))

db.once('open', () => console.log('Connected, database is up'))




app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.set('views', './views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
    res.render('index.pug', {
        title: 'User Manager',
        subTitle: 'Adding Students'

    })
})

app.post('/addingStudent', (req, res) => {

    let user = new User() 
        user.full_name =  req.body.full_name;
        user.id = uuidv4();
        user.markModified('id');
        user.age = req.body.age;
        user.email = req.body.email;
        user.save((err, data) => {
            if(err) {
                console.log(err)
            } 
            res.redirect('/studentList')
        })
})

app.get('/studentList', async (req, res) => {


    await User.find({}, (err, data) => {
        console.log(data)
        res.render('userPage.pug', {
            users: data
        })
    })

})

app.get('/editUser', async (req, res) => {

    await User.find({}, (err, data) => {
        console.log(data)
        res.render('editUser.pug', {
            users: data
        })
    })  

})



app.post('/removeUser/:delete', async (req, res) => {
    await User.findOneAndDelete({ id: req.params.delete })
    res.redirect('/studentList')
})

app.listen(port, err => {
    if (err) throw err;
    console.log('Listening on port 4000')
})
