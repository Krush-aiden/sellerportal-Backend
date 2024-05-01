const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const fileSystem = require('fs');
const multer = require("multer");
const moment = require('moment')
const { GridFsStorage } = require("multer-gridfs-storage");
let Grid = require('gridfs-stream'); //it is used to directly show Images from Mongo-Database to the client side => without using the upload folder structure
// but as the folder structure is the effcient way we will learn that way only 
const { createHmac } = require('crypto')
const CookieParser = require('cookie-parser')
const path = require('path');

// app.use(express.json());

// app.use(express.urlencoded({
//     extended: true
// }));

app.use(bodyParser.json());
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));

// app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(CookieParser())

// app.use(cors());
let jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const { stringify } = require('querystring');
const { PassThrough } = require('stream');
const router = express.Router()

// console.log('publicValues', publicValues)

// app.use((req,res,next)=>{
//     req.currentTime = new Date().toISOString(); 
//     next();
// });


// it is used of SSR => Server-Side-Rendering
// app.set('view engine', 'ejs');

//Get Method => using ROUT
// it is used to test the server is working or Not => later we might study more about it;

// let imagePath = 
console.log("🚀 ~ process.env.MONGODB_CONNECT_URL:", process.env.MONGODB_CONNECT_URL);

const conn = mongoose.connect("mongodb+srv://krushnamahapatra8:I6YmGnlYQQCtl7GB@newcollection.a0elhc1.mongodb.net/?retryWrites=true&w=majority&appName=newCollection");
//newCollection is Db Name
const currentDate = moment().format('MMMM_Do_YYYY_h:mm:ss_a');

const addProductSchema = new mongoose.Schema({

    time: {
        type: String,
        default: currentDate
    },
    productName: {
        type: String
    },
    productPrice: {
        type: String
    },
    quantity: {
        type: Number
    },
    productCat: {
        type: String
    },
    productcode: {
        type: String
    },
    productDis: {
        type: String
    },
    uniqueEmailId: {
        type: String
    },
    username: {
        type: String
    },
    imageName: {
        type: String,
        default: ""
    }

}, { versionKey: false });

const registerUserSchema = new mongoose.Schema({
    time: {
        type: String,
        default: currentDate
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    emailAddress: {
        type: String
    },
    userOTP: {
        type: Number
    },
    OTPsecretKey: {
        type: String
    },
    uniqueEmailId: {
        type: String
    },
    OTPType: {
        type: String
    },
    uniqueUserId: {
        type: String
    }
})

const ProductDetails = mongoose.model("productList", addProductSchema);
const registerData = mongoose.model("registerUserData", registerUserSchema);

// ====> locally stores Images <=====
app.use('/uploads', express.static('upload/images'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

function fileFilter(req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


const getAllproductData = async (uniqueEmailId) => {
    return await ProductDetails.find({ uniqueEmailId: uniqueEmailId }).then((res) => {
        return res
    })
}
const getSIngleUserByname = async (mongoID) => {
    // console.log('mongoID', mongoID)
    return await ProductDetails.findOne({ _id: mongoID }).then((res) => {
        // console.log('res---', res)
        return res
    })
}
const updateSingleProduct = async (mongoID, reqBody, reqFile) => {
    // console.log('reqBody', reqBody)
    // console.log('reqFile', reqFile)
    console.log('reqBody.filename', reqBody.imageName);

    return await ProductDetails.findOneAndUpdate(
        { _id: mongoID },
        {
            productName: reqBody.productName,
            productPrice: reqBody.productPrice,
            productCat: reqBody.productCat,
            productcode: reqBody.productcode,
            productDis: reqBody.productDis,
            quantity: reqBody.quantity,
            imageName: reqFile ? reqFile.filename : reqBody.imageName
        },
        { new: true }
    ).then((res) => {
        // console.log('res', res)
        return res
    })
}

const updateUserDataforForgetPassword = async (otpTokenResult, reqBody, reqFile) => {
    console.log("🚀 ~ updateUserDataforForgetPassword ~ otpTokenResult:", otpTokenResult)

    return await registerData.findOneAndUpdate(
        { emailAddress: reqBody.userEmailAddress },
        {
            userOTP: otpTokenResult.otpToken,
            OTPsecretKey: otpTokenResult.OTPsecretKey,
            OTPType: reqBody.OTPType
        },
        { new: true }
    ).then((res) => {
        // console.log('res', res)
        return res
    })
}

const deleteUser = async (DeletenameParam) => {
    console.log('DeletenameParam', DeletenameParam)
    return await ProductDetails.findOneAndDelete({ _id: DeletenameParam }).then((res) => {
        return res
    })
}




//get is used to send the data to the URL through => RES.end => this is basically used to send API Data 
app.get('/showAllProducts/:uniqueEmailId', multer().none(), (req, getRes) => {
    console.log("🚀 ~ app.get ~ req:", req.params.uniqueEmailId);
    getAllproductData(req.params.uniqueEmailId).then((res) => {
        // console.log("🚀 ~ getAllproductData ~ res:", res)
        getRes.status(200).json({ productItems: res });
    })
});


//to fetch single User by name
app.get('/toDoList/:mongoID', (req, singleres) => {
    console.log('req.params.mongoID', req.params.mongoID)

    getSIngleUserByname(req.params.mongoID).then((res) => {
        // console.log('res', res)
        singleres.json(res)
    })
})

require('dotenv').config()
const nodemailer = require('nodemailer')
let speakeasy = require('speakeasy');

// 2 factor Authentication process =>
const user = {}
let secret = speakeasy.generateSecret();
user.two_factor_temp_secret = secret.base32
// console.log("🚀 ~ user.two_factor_temp_secret:", user.two_factor_temp_secret)

const verifiyAuthToken = async function (req, res, next) {
    let verified = speakeasy.totp.verify({
        secret: process.env.base32secret,
        encoding: 'base32',
        token: req.body.token
    })
    console.log("🚀 ~ verifiyAuthToken ~ verified:", verified)

    res.json({ msg: verified })
    next()
}

app.post("/auth", multer().none(), verifiyAuthToken)


//implement send email otp feature =>

const generateOTPToken = async () => {
    return new Promise((resolve, reject) => {
        let secretKey = speakeasy.generateSecret({ length: 20 });
        let otpToken = speakeasy.totp({
            secret: secretKey.base32,
            encoding: 'base32',
            time: 600 // specified in seconds
        });
        console.log("🚀 ~ returnnewPromise ~ otpToken:", otpToken);

        resolve({
            "otpToken": otpToken,
            "OTPsecretKey": secretKey.base32
        })
    })
}


const verifyOtpToken = async function (req, res, next) {
    console.log("req.body----------->>>", req.body);
    console.log("🚀 ~ verifyOtpToken ~ req.body:", req.body.emailOTP);
    // const otp = req.body.emailOTP.stringify()
    const uniqueUserIdCheck = await registerData.findOne({ uniqueUserId: req.body.uniqueUserID })
    console.log("🚀 ~ verifyOtpToken ~ uniqueUserIdCheck:", uniqueUserIdCheck);

    if (!uniqueUserIdCheck) {
        res.status(400).json({ "msg": "session expired" })
        return;
    };

    const otpUserDetails = await registerData.findOne({ userOTP: req.body.emailOTP })

    console.log("🚀 ~ verifyOtpToken ~ otpUserDetails:", otpUserDetails)
    if (!otpUserDetails) {
        res.status(400).json({ "msg": "otp didn't match" })
        return;
    };

    if (otpUserDetails) {
        if (otpUserDetails.userOTP == req.body.emailOTP) {
            var tokenValidates = speakeasy.totp.verify({
                secret: otpUserDetails.OTPsecretKey,
                encoding: 'base32',
                token: otpUserDetails.userOTP,
                time: 600 // specified in seconds
            });
        }
        // if(token === req.body.token)
        console.log("🚀 ~ verifyOtpToken ~ tokenValidates:", tokenValidates)

        if (tokenValidates) {
            req.OTPtokenValidate = (otpUserDetails.userOTP == req.body.emailOTP)
            req.otpUserDetails = otpUserDetails;
            req.username = otpUserDetails.username;
            req.OTPType = otpUserDetails.OTPType;
            req.uniqueEmailId = otpUserDetails.uniqueEmailId,
                req.uniqueUserId = otpUserDetails.uniqueUserId ? otpUserDetails.uniqueUserId : "";
        }
    }

    next();
}



app.post("/otpVerify", multer().none(), verifyOtpToken, async (req, res) => {

    console.log("🚀 ~ app.post ~ req.OTPtokenValidate:", req.OTPtokenValidate)
    console.log("🚀 ~ app.post ~ req.otpUserDetails:", req.otpUserDetails)

    if (req.OTPtokenValidate) {
        console.log('req.username', req.username)
        const jwtToken = await generateJWTToken(req.otpUserDetails.username, req.otpUserDetails.emailAddress)
        console.log("🚀 ~ app.post ~ jwtToken:", jwtToken)

        res.cookie('name', 'tobi', {
            secure: true,
            httpOnly: true,
            sameSite: "none",
            expires: new Date(Date.now() + 999999),
        });

        if (req.OTPType == "forgetPassword") {
            res.status(200).json({
                "msg": "forgetPassword OTP verify successfully",
                OTPType: req.OTPType,
                uniqueUserId: req.uniqueUserId
            })
        } else {
            res.status(200).json({
                "msg": "user OTP verify successfully",
                token: jwtToken,
                username: req.username,
                OTPType: req.OTPType,
                uniqueUserId: req.uniqueUserId,
                uniqueEmailId: req.uniqueEmailId,
            })
        }


    }
    console.log("🚀 ~ app.post ~ req.username:", req.username)

})

//getUserDetails
app.post("/resetPasswordSave", multer().none(), async function (req, resetRes) {
    console.log("🚀 ~ req:", req.body);
    // console.log("🚀 ~ res:", res);

    const findUniqueID = await registerData.findOne({
        uniqueUserId: req.body.uniqueUserID
    });

    console.log("🚀 ~ app.get ~ findUniqueID:", findUniqueID);
    const salRound = await bnyCrypt.genSalt(10)
    const encryptedPassword = await bnyCrypt.hash(req.body.resetNewpassword2, salRound)
    console.log("🚀 ~ process.env.myPlaintextPassword:", process.env.myPlaintextPassword)
    const afterResetNewUniqueUserID = createHmac('sha256', process.env.myPlaintextPassword).update(req.body.uniqueUserID).digest('hex');
    console.log("🚀 ~ afterResetNewUniqueUserID:", afterResetNewUniqueUserID)

    if (findUniqueID) {
        registerData.findOneAndUpdate(
            { uniqueUserId: req.body.uniqueUserID },
            {
                password: encryptedPassword,
                uniqueUserId: afterResetNewUniqueUserID
            }
        ).then((res) => {
            console.log('res', res);
            if (res) {
                resetRes.status(200).json({ "msg": "password reset successfully" });
            } else {
                resetRes.status(400).json({ "msg": "password unable to reset successfully" });
            }
        })

    } else {
        resetRes.status(400).json({ "msg": "session expired" });
    }
})

const transporter = nodemailer.createTransport({
    host: process.env.SMPT,
    port: process.env.HOST,
    secure: false,

    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})
const sendMailFunction = async function (otpToken, userEmailAddress, sendMailReason) {
    // return new Promise((resolve, reject)=>{
    const sendMail = transporter.sendMail({
        from: {
            name: 'Seller-Admin',
            address: "krushnamahapatra8@gmail.com"
        }, // sender address
        to: userEmailAddress, // list of receivers
        subject: sendMailReason, // Subject line
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">seller portal</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Welcome to seller portal. Use the following OTP to complete your ${sendMailReason} procedures. OTP is valid for 10 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otpToken}</h2>
        <p style="font-size:0.9em;">Regards,<br />seller portal</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>seller portal Inc</p>
            <p>1600 bengaluru</p>
            <p>India</p>
        </div>
        </div>
    </div>`,

    }, (error, result) => {
        if (result) console.log("🚀 ~ returnnewPromise ~ error:", result)
        if (error) {
            console.log("🚀 ~ returnnewPromise ~ error:", error)
        }
    });
    // });
}




//JWT Token generate
const bnyCrypt = require('bcryptjs');
const { error } = require('console');
const { rejects } = require('assert');
const { env } = require('process');

const generateJWTToken = async function (username, emailAddress) {
    return await jwt.sign(
        {
            userID: username,
            emailAddress: emailAddress,
            isAdmin: false
        },
        process.env.tokenSecterKey,
        {
            expiresIn: "2d"
        },
        { algorithm: 'RS256' });
}

// Signup & login process
app.post('/signUp', multer().none(), async function (req, res) {
    // console.log("🚀 ~ req.body.userEmailAddress:", req.body.userEmailAddress)

    const uniqueUserId = await registerData.findOne({
        username: req.body.userName
    })
    if (uniqueUserId) {
        res.status(400).json({ "msg": "UserName already exists" });
        return;
    }

    const alreadyEmailExists = await registerData.findOne({
        emailAddress: req.body.userEmailAddress
    })
    if (alreadyEmailExists) {
        res.status(400).json({ "msg": "email already exists" });
        return;
    }

    if (!alreadyEmailExists && !uniqueUserId) {

        const OTPTokenResult = await generateOTPToken()
        console.log("🚀 ~ emailOTP:", OTPTokenResult)

        let sendMailResult;
        if (OTPTokenResult.otpToken) {
            //  sendMailResult = await sendMailFunction(OTPTokenResult.otpToken, req.body.userEmailAddress);
            // console.log("🚀 ~ sendMailResult:", sendMailResult)
        }

        // token :jwtToken,
        console.log("🚀 ~ req.emailOTP:", OTPTokenResult.otpToken)

        const salRound = await bnyCrypt.genSalt(10)

        if (OTPTokenResult.otpToken) {
            const encryptedPassword = await bnyCrypt.hash(req.body.userPassword, salRound)
            const uniqueUserID = createHmac('sha256', process.env.myPlaintextPassword).update(req.body.userName).digest('hex');
            const uniqueEmailID = createHmac('sha256', process.env.myPlaintextPassword).update(req.body.userEmailAddress).digest('hex');
            console.log("🚀 ~ uniqueEmailID:", uniqueEmailID)


            const registerUsers = registerData({
                username: req.body.userName,
                uniqueEmailId: uniqueEmailID,
                password: encryptedPassword,
                emailAddress: req.body.userEmailAddress,
                userOTP: OTPTokenResult.otpToken,
                OTPsecretKey: OTPTokenResult.OTPsecretKey,
                OTPType: req.body.OTPType,
                uniqueUserId: uniqueUserID
            });

            registerUsers.save().then((result, err) => {
                if (result) {
                    const resItems = {
                        username: result.username,
                        emailAddress: result.emailAddress,
                        uniqueUserId: uniqueUserID,
                        uniqueEmailID: uniqueEmailID
                    }
                    res.status(200).json({
                        resItems, msg: "user created successfully"
                    })
                }
                if (err) {
                    res.status(400).json({ msg: "Signup process failed" })
                }
            })
        } else {
            res.status(400).json({ msg: 'Signup process Failed' })
        }
        sendMailFunction(OTPTokenResult.otpToken, req.body.userEmailAddress, 'sign Up');
    }
})

//forgetPassword Process
app.post('/forgetPassword', multer().none(), async function (req, res) {
    console.log("🚀 ~ app.post ~ req:", req)
    const alreadyEmailExists = await registerData.findOne({
        emailAddress: req.body.userEmailAddress
    })
    if (!alreadyEmailExists) {
        res.status(400).json({ "msg": "email doesn't exists" });
    }

    if (alreadyEmailExists) {
        const OTPTokenResult = await generateOTPToken()
        console.log("🚀 ~ emailOTP:", OTPTokenResult)

        // token :jwtToken,
        console.log("🚀 ~ req.emailOTP:", OTPTokenResult.otpToken)

        if (OTPTokenResult.otpToken) {
            updateUserDataforForgetPassword(OTPTokenResult, req.body).then((item) => {
                console.log(item);
                const resItems = {
                    emailAddress: item.emailAddress,
                    username: item.username,
                    uniqueUserId: item.uniqueUserId
                }
                res.status(200).json({ resItems, msg: 'successfully OTP Item' })
            })

        } else {
            res.status(400).json({ msg: 'OTP sent Failed' })
        }
        sendMailFunction(OTPTokenResult.otpToken, req.body.userEmailAddress, 'forgetPassword');
    }

})




app.post('/login', multer().none(), async function (req, res) {
    console.log("🚀 ~ req:", req.body);

    const { emailAddress, password } = req.body

    const emailExists = await registerData.findOne({
        emailAddress: emailAddress
    })

    console.log("🚀 ~ emailExists:", emailExists)
    console.log("🚀 ~ emailExists:", emailExists?.password)

    let passwordCheck;
    if (emailExists?.password) {
        passwordCheck = await bnyCrypt.compare(password, emailExists?.password);
    }
    console.log("🚀 ~ passwordCheck:", passwordCheck)

    if (emailExists && passwordCheck) {
        const token = await generateJWTToken(emailExists.username, emailExists.emailAddress);
        res.json({
            username: emailExists.username,
            uniqueEmailId: emailExists.uniqueEmailId,
            msg: 'New user saved',
            token: token
        });
    } else {
        res.status(400).json({ message: "invalid credential" })
    }

});


app.post('/profileUpdate', multer().none(), async function (req, res) {
    console.log('req--profileUpdate', req.body.newUserNameValue)

    const bearHead = req.header('authorization');

    const isVerified = jwt.verify(bearHead, process.env.tokenSecterKey);
    // console.log("🚀 ~ isVerified:", isVerified);

    const verifyEmail = registerData.findOne({ emailAddress: isVerified.emailAddress })

    if (verifyEmail) {
        const newUsernameUpdatevalue = await registerData.findOneAndUpdate(
            { emailAddress: isVerified.emailAddress },
            {
                username: req.body.newUserNameValue
            },
            { new: true }
        )
        console.log("🚀 ~ username:", newUsernameUpdatevalue.username);
        const updatedValue = {
            newUserNameValue: newUsernameUpdatevalue.username
        }
        res.status(200).json(updatedValue);
    } else {
        res.status(400).json('user doesnt exists');
    }

});



//Verify Token for CRUD operation using Post Method & save all the Product data
const verifyToken = async (req, res, next) => {

    const bearHead = req.header('authorization');
    console.log("🚀 ~ middleWareOne ~ bearHead:", bearHead)

    let jwtKeyDetails;
    if (bearHead) {
        try {
            jwtKeyDetails = jwt.verify(bearHead, process.env.tokenSecterKey);
            console.log("🚀 ~ middleWareOne ~ jwtKeyDetails:", jwtKeyDetails);
            if (jwtKeyDetails) {
                const uniqueuser = await registerData.findOne({ emailAddress: jwtKeyDetails?.emailAddress })
                console.log("🚀 ~ middleWareOne ~ uniqueuser:", uniqueuser);

                if (uniqueuser) {
                    req.verifiedUser = uniqueuser?.username;
                } else {
                    req.verifiedUser = false;
                }
            }
            console.log("req.verifiedUser", req.verifiedUser);
        } catch (error) {
            req.error = 'jwt failed error';
            console.log("🚀 ~ verifyToken ~ error:", error)
        }

    }
    next()


}
// Post method is used => save the product data in the DB
app.post('/addProduct', upload.single('myFile'), verifyToken, (req, res) => {
    console.log('req-body', req.body);
    console.log('req.verifiedUser', req.verifiedUser);

    if (req.verifiedUser) {
        const newProduct = new ProductDetails({
            productName: req.body.productName,
            productPrice: req.body.productPrice,
            productCat: req.body.productCat,
            productcode: req.body.productcode,
            productDis: req.body.productDis,
            uniqueEmailId: req.body.uniqueEmailId,
            quantity: req.body.quantity,
            imageName: req.file?.filename
        });

        newProduct.save().then(item => {
            console.log('item-saved', item);
            // user['msg'] = 'your Product data saved'
            res.json({ item, msg: 'your Product data saved' });
        });
    } if (req.error) {
        res.status(400).json({ msg: req.error })
    }
});

//patch method update only the existing value, or create a new key there on the same doc 
app.patch('/updateProduct/:mongoID', upload.single('myFile'), verifyToken, (req, patchRes) => {
    console.log('req-file-inside patch', req.file);
    console.log('req.body-inside patch', req.body);
    // console.log('req.params.name', req.params.name) => 

    // console.log("🚀 ~ app.patch ~ req.verifiedUser:", req.verifiedUser)
    if (req.verifiedUser) {
        updateSingleProduct(req.params.mongoID, req.body, req.file).then((item) => {
            // console.log(item);
            patchRes.status(200).json({ item, msg: 'successfully Deleted Item' })
        })
    } if (req.error) {
        res.status(400).json({ msg: req.error })
    }

});


//Delete user by single name
app.delete('/deleteProduct/:mongoID', verifyToken, (req, res) => {
    console.log('req.body-inside delete', req.params.delname);
    console.log('req.verifiedUser', req.verifiedUser);

    if (req.verifiedUser) {
        deleteUser(req.params.mongoID).then((delItem) => {
            res.json({ delItem, msg: 'successfully Deleted Item' });
        });
    }
    // res.json('hello from delete');
});


//puts method overrides the existing document & create a new doc with new data => that's why not required
// app.put('/toDoList',(req,res)=>{ 
// });

//start Servers


// const __dirname1 = path.resolve();

// console.log('process------>', process.env.NODE_ENV);

// let environment = "production";

// if (environment == "production") {
//     console.log('asdasdas');
//     app.use(express.static(path.join(__dirname1, "/seller/browser")))
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname1, "seller", "browser", "index.html"));
//     })
// } else {
//     app.get("/", (req, res) => {
//         res.send("API is Running Successfully");
//     });
// }

app.listen(port, () => {
    console.log('server is running on port', port);
});

app.get("/", (req, res) => {
    console.log('req-->');
    res.send("API is Running Successfully");
});

//Recap => fundamental Node.js
//Read-Write files => fs module //Core-module
// create Server => host it in 9000 port => sending data & html pages to the server //Core-module => http Module
// creating own Api => using of read file Module => storing the file data into a variable & sending it through the help of http Server as re.end() => then is called as our own API => sending api to the server
// Installing 3rd party modules => nodemon, slufigy

//express Learning
// postMan install => how to use it instead of browser to deal with the API you created
// 4 imp methods, GET, POST, PUT, PATCH, DELETE => while create CRUD project will learn individually
// MIIDLEWARE => a very IMP concept as it helps to get the req from the browser & send the response => the MIDDLEWARE which complete the REQ-RES cycle first is the only MIDDLWARE going to be executed => all those REQ, POST methods are also MIDDLEWARE