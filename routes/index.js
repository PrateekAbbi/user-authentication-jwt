const router = require("express").Router();

const user = require("../controllers/index");
const multer = require("../utils/multer");

router.post("/register", user.register);
router.post("/login", user.logIn);
router.put("/uploadImage", multer.single("image"), user.uploadImage);

module.exports = router;
