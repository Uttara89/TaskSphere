const multer  = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) { // cb is callback function which is used to pass the destination and filename to multer
      cb(null, "./public/temp") // null means no error 
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)// null means no error and file.originalname is the name of the file which is uploaded by the user
    }
  })
  
const upload = multer({ 
    storage, 
})

module.exports = { upload };