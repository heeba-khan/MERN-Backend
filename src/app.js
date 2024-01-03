require('dotenv').config()
const express=require('express')
const path=require('path')
const hbs=require('hbs')
require('./db/conn')
const Register=require('./models/model')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')


const app=express()
const port=process.env.PORT||3000

const static_path=path.join(__dirname,'../public')
const template_path=path.join(__dirname,'../templates/views')
const partials_path=path.join(__dirname,'../templates/partials')

app.use(express.static(static_path))
app.set('view engine','hbs')
app.set('views',template_path)
hbs.registerPartials(partials_path)

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    res.render("index")
})

app.get('/register',(req,res)=>{
    res.render("register")
})

app.get('/login',(req,res)=>{
    res.render("login")
})

app.post('/register',async(req,res)=>{
    try{
        const password=req.body.password
        const cpassword=req.body.confirmpassword

        if(password===cpassword){
            const registerEmployee=new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:password,
                confirmpassword:cpassword,
            })

            console.log("The success part"+registerEmployee);

            const token=await registerEmployee.generateAuthToken()
            console.log("The token part "+token);
            
            const registered=await registerEmployee.save()
            res.status(201).render("index")

        }
        else{
            res.send("Passwords are not matching")
        }
    }
    catch(e){
        res.status(404).send(e)
        console.log("error part page");
    }
})

app.post('/login',async(req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password

        const useremail=await Register.findOne({email:email})
        // res.send(useremail)

        const isMatch=await bcrypt.compare(password,useremail.password)

        const token=await useremail.generateAuthToken()
        console.log("The token part "+token);

        if(isMatch){
            res.status(201).render("index")
        }else{
            res.send("INVALID LOGIN DETAILS")
        }

    }

    catch(e){
        res.status(404).send(e)
    }
})



/*HASHING TECHNIQUE USING BCRYPT JS(example)*/
// const bcrypt=require('bcryptjs')
// const securePassword=async(password)=>{
//     const passwordHash=await bcrypt.hash(password,10)
//     console.log(passwordHash);

//     const passwordcomp=await bcrypt.compare(password,passwordHash)
//     console.log(passwordcomp);
// }
// securePassword("heeba@123")



/*JWT EXAMPLE*/
// const jwt=require('jsonwebtoken')

// const createToken=async()=>{
//     const token=await jwt.sign({_id:"6593a6f72f30214925725442"},"mynameisheebakhanandiamnotaterrorist",{expiresIn:"2 seconds"})
//     console.log(token);

//     const userverify=await jwt.verify(token,"mynameisheebakhanandiamnotaterrorist")
//     console.log(userverify);
// }

// createToken()


app.listen(port,()=>{
    console.log(`Server is running at port number ${port}`);
})