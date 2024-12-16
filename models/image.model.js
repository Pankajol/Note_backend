const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const imgSchema = new Schema({
    title:{type: String, required:true},
    userId:{type:String, required:true},
    createdOn:{type:Date, default:new Date().getTime() },
});
module.exports = mongoose.model("Image",imgSchema);