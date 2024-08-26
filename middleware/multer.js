import multer from 'multer';
import sharpMulter from 'sharp-multer';
// Configure storage for Multer
const storage = sharpMulter({
  imageOptions: {
    fileFormat: "webp",
    quality: 50,
    useTimestamp: true
    // resize: { width: 500, height: 500, resizeMode: "contain" },
  },
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Save files in the public/uploads directory
  },
  filename: (og_filename, options) => {
    const newname =
      og_filename.split(".").slice(0, -1).join(".") +
      `${options.useTimestamp ? "-" + Date.now() : ""}` +
      "." +
      options.fileFormat;
    return newname;
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only images are allowed (jpeg, jpg, png, gif)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Limit file size to 30MB
  fileFilter: fileFilter
});

export const uploadSingle = (fieldName) => upload.single(fieldName);