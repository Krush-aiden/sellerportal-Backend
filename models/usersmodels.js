
const mongoose = require("mongoose");
const userDetailSchema = new mongoose.Schema({
    time: {
        type : String
    },
    name: {
        type : String
    },
    address: {
        type: String
    },
    number: {
        type : Number
    },
    myFile:   {
        data: Buffer,
        contentType: String
    }    
},
{timestamps: true}
); 

const userDetail = mongoose.model("newCollection", userDetailSchema);
module.exports = userDetail;
