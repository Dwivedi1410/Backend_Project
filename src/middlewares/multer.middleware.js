import multer from "multer";

const storage = multer.diskStorage({
  // Defines a custom storage engine where files will be stored on disk

  destination: function (req, file, cb) {
    // destination: This function tells multer where to save the file.

    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    // filename: This function tells multer how to name the uploaded file

    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })


// router.post('/upload', upload.single('file'), (req, res) => { ... })
