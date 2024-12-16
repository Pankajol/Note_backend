const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title:{type: String, required:true},
    content:{type:String,required:true},
    tags:{type:[String],default:[]},
    isPinned:{type:Boolean,default:false},
    imgurl:{type:String,required:true},
    // files: [
    //     {
    //       url: String,  // File URL from Cloudinary
    //       type: String, // File type (e.g., image/jpeg, video/mp4, application/pdf)
    //     },
    //   ],
   
    userId:{type:String, required:true},
    createdOn:{type:Date, default:new Date().getTime() },
});

module.exports = mongoose.model("Note",noteSchema);

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const noteSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   content: {
//     type: String,
//     required: true,
//   },
//   tags: [String],
//   isPublic: {
//     type: Boolean,
//     default: false,
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId, // Reference to User model
//     ref: 'User',
//     required: true, // Ensure it's required
//   },
// }, { timestamps: true });

// const Note = mongoose.model('Note', noteSchema);

// module.exports = Note;
