require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(process.env.DBSTRING);
const User = require("./models/user.model");
const Note =  require("./models/note.model");
const Image = require("./models/image.model")

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./utilities");
const upload= require("./upload")


app.use(express.json());

// const corsOptions = {
//     origin: ['https://notesapp2099.vercel.app', 'http://localhost:5173'],
//     optionsSuccessStatus: 200,  // Use the correct option
//     credentials: true, 
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };
// app.use(
//    cors(corsOptions)
// );


const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
app.get("/",(req,res) =>{
    res.json({
        data:"hello"
    });
});
// upload file
// app.post('/upload', upload.single('file'), async (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
//     console.log('Uploaded file:', req.file);
  
//     // Save the URL in the database
//     // const imageShema = new Image({
//     //   url: req.file.path,
//     // });
  
//     // await imageShema.save();
  
//     res.status(200).json({
//       message: 'File uploaded and URL saved successfully',
//       url: req.file.path,
//     });
//   });
// Create Account

app.post("/create-account",async (req,res)=>{
    const {fullName,email,password} = req.body;

    if(!fullName){
        return res
            .status(400)
            .json({error:true, message:"Full Name is required"});
    }

    if(!email){
        return res
        .status(400)
        .json({error:true, message:"Email is required"});
    }

    if(!password){
        return res
        .status(400)
        .json({error:true, message:"Password is required"});
    }

    const isUser = await User.findOne({email:email})

    if(isUser){
        return res.json({
            error:true,
            message:"User already exist",
        });
    }
    const user = new User({
        fullName,
        email,
        password,


    });

    await user.save();

    const accessToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"36000m",
    });

    return res.json({
        error:false,
        user,
        accessToken,
        message:"Registration Successful",
    });
});

// login here
app.post("/login",async (req,res) =>{
    const {email,user,password} = req.body;

    if(!email){
        return res.status(400).json({
            message:"Email is requried"
        })
    }

    if(!password){
        return res.status(400).json({
            message:"Password is requried"
        }) 
    }

    const userInfo = await User.findOne({email:email});
    if(!userInfo){
        return res.status(400).json({ message:"User not found"});
    }

    if(userInfo.email == email && userInfo.password == password){
        const user = {user:userInfo};
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"36000m"
        });
        return res.json({
            error:false,
            message:"Login Successfully",
            email,
            accessToken,
        });
    } else{
        return res.status(400).json({
            error:true,
            message:"Invalid Credentials",
        });
    }
})
// Get user
app.get("/get-user",authenticateToken , async (req,res) =>{
    const {user} = req.user;

    const isUser = await User.findOne({_id:user._id});

    if(!isUser){
        return res.status(401);
    }

    return res.json({
        user:{
            fullName: isUser.fullName,
            email: isUser.email,
            _id:isUser._id,
            createdOn: isUser.createdOn
        },
        message:"",
    });
})
 
// Add note

// app.post("/add-note",authenticateToken ,upload.single('file'), async (req,res) =>{
//     const {title,content,tags} = req.body;
//     const { user } = req.user;

//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//       }
//       console.log('Uploaded file:', req.file);
    
//     if(!title){
//         return res.status(400).json({
//             error:true,
//             message:"Title is required"
//         });
//     }


//     if(!content){
//         return res.status(400).json({
//             error:true,
//             message:"Content is required"
//         });
//     }

//     if(!tags){
//         return res.status(400).json({
//             error:true,
//             message:"Tags is required"
//         });
//     }
//     // if(!imgurl){
//     //     return res.status(400).json({
//     //         error:true,
//     //         message:"Image is required"
//     //     });
//     // }

//     try {
//         const note = new Note({
//             title,
//             content,
//             tags:tags || [],
//             imgurl: req.file.path,
//             userId: user._id,
//         });
//         await note.save();

//         return res.json({
//             error: false,
//             note,
//             message:"Note added successfully",
//         })
//     } catch (error) {
//         return res.status(500).json({
//            error:true,
//            message:"Internal Server Error",
//         })
//     }
// })

// chat-gpt add nots
app.post('/add-note', authenticateToken, upload.single('file'), async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;
  
    if (!title || !content) {
      return res.status(400).json({
        error: true,
        message: 'Title and Content are required',
      });
    }
  
    // Handle file upload to Cloudinary
    const fileUrl = req.file ? req.file.path : null;
    // let fileUrl = '';
    // if (req.file) {
    //   fileUrl = req.file.path; // Get the Cloudinary URL
    // }
  
    try {
      const note = new Note({
        title,
        content,
        tags: tags ? tags.split(',') : [],
        imgurl: fileUrl, // Store Cloudinary file URL
        userId: user._id,
        fileType: req.file.mimetype,
      });
  
      await note.save();
  
      return res.json({
        error: false,
        note,
        message: 'Note added successfully',
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: 'Internal Server Error',
      });
    }
  });

// Edit Note

// app.put("/edit-note/:noteId",authenticateToken ,upload.single('file'), async (req,res) =>{
//   const noteId = req.params.noteId;
//   const {title,content,tags,isPinned,image} = req.body;
//   const {user} = req.user;

//   if(!title && !content && !tags && !file){
//     return res
//         .status(400)
//         .json({error:true,message:"No changes provided"});
//   }
//   try {
//     const note = await Note.findOne({_id:noteId,userId:user._id});

//     if(!note){
//        return res.status(404).json ({error:true,message:"Note not found"});
//     }

//     if(title) note.title = title;
//     if(content) note.content = content;
//     if(tags) note.tags = tags;
//     if(isPinned) note.isPinned = isPinned;
//     if(image) note.image=  image;


//     await note.save();

//     return res.json({
//         error:false,
//         note,
//         message:"Note updated successfully",
//     })

//   } catch (error) {
//      return res.status(500).json({
//         error:true,
//         message:"Internal Server Error",

//      });
//   }
// })

// chat-gpt edit
app.put("/edit-note/:noteId", authenticateToken, upload.single('file'), async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body; // Extracting fields from the request body
    const { user } = req.user; // Extracting user from the authenticated request
    const file = req.file; // Extracting the file uploaded by multer
  
    // Check if no updates are provided
    if (!title && !content && !tags && !file && typeof isPinned === 'undefined') {
      return res.status(400).json({ error: true, message: "No changes provided" });
    }
  
    try {
      // Find the note by noteId and userId
      const note = await Note.findOne({ _id: noteId, userId: user._id });
  
      // If the note doesn't exist
      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }
  
      // Update the note fields if they are provided
      if (title) note.title = title;
      if (content) note.content = content;
      if (tags) note.tags = tags;
      if (typeof isPinned !== 'undefined') note.isPinned = isPinned;
      if (file) note.imgurl = file.path; // Save the file path to the image field if a file is uploaded
  
      // Save the updated note
      await note.save();
  
      // Send back the updated note
      return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });
    } catch (error) {
      // Handle server errors
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  });

// Get all notes

app.get("/get-all-notes/",authenticateToken, async(req,res) =>{
    const {user} = req.user;

    try {
        const notes = await Note.find({ userId:user._id})
        .sort({ isPinned: -1 });

        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error:true,
            message:"Internal Server Error",
        })
    }

});

// Detet Note

app.delete("/delete-note/:noteId",authenticateToken, async(req,res) =>{
  const noteId = req.params.noteId;
  const {user} = req.user;

  try {
    const note = await Note.findOne({_id:noteId,userId:user._id});
    if(!note){
        return res.status(404).json({
            error:true,
            message:"Note not found"
        });
    }
    await Note.deleteOne({_id:noteId,userId:user._id});

    return res.json({
        error:false,
        message:"Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
        error:true,
        message:"Internal Server Error"
    });
  }
});

// Upate isPinned
app.put("/update-note-pinned/:noteId",authenticateToken , async (req,res) =>{
    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const {user} = req.user;
  
   
    try {
      const note = await Note.findOne({_id:noteId,userId:user._id});
  
      if(!note){
         return res.status(404).json ({error:true,message:"Note not found"});
      }
  
     
     note.isPinned = isPinned ;
  
  
      await note.save();
  
      return res.json({
          error:false,
          note,
          message:"Note updated successfully",
      })
  
    } catch (error) {
       return res.status(500).json({
          error:true,
          message:"Internal Server Error",
  
       });
    }
  })

// Search Notes
app.get("/search-note/",authenticateToken , async (req,res) =>{
 const { user } = req.user;
 const {query} = req.query;
 if(!query){
    return res
    .status(400)
    .json({error:true,message:"Search query is required"});
 } 
 try {
    const matchingNotes = await Note.find({
        userId: user._id,
        $or:[
            {title:{$regex: new RegExp(query,'i')}},
            {content:{$regex: new RegExp(query,'i')}},
        ],
    });
    return res.json({
        error:false,
        notes:matchingNotes,
        message:"Notes matching the search query retrieved successfully",
    });
 } catch (error) {
    return res.status(500).json({
        error:true,
        message:"Internal Server Error",
    });
 }
})
app.listen(process.env.PORT || 4000,()=> {
    console.log("connection succ")
});


module.exports = app;