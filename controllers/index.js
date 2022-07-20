const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const cloudinary = require("../utils/cloudinary");

const jwtToken = process.env.JWT_SECRET;

module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email && !password)
    res.status(400).send("All Fields are required");

  const oldUser = await User.findOne({ email });

  if (oldUser)
    res
      .status(409)
      .send(
        "User already exists with that email. Please try again with another email"
      );

  encryptedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: encryptedPassword,
  });

  const token = jwt.sign({ user_id: user._id, email }, jwtToken, {
    expiresIn: "24h",
  });

  user.token = token;

  res.status(201).json(user);
};

module.exports.logIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) res.status(400).send("All fields are required");

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ user_id: user._id, email }, jwtToken, {
      expiresIn: "24h",
    });

    user.token = token;

    res.status(200).send(user);
  }
};

module.exports.uploadImage = async (req, res) => {
  const file = req.file.path;
  const email = req.query.email;

  if (!email) {
    res.status(400).send("Please login to update your image");
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: "userAvatar/",
  });

  const user = await User.updateOne(
    { email },
    {
      imageUrl: result.url,
    }
  );
  if (user.modifiedCount >= 1)
    res.status(200).send("Image Updated succesfully");
};
