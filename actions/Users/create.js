"use strict";
const { Action, api } = require("actionhero");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { regex } = require("../../index");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const { tokenConfig } = require("../../index");

cloudinary.config({
  cloud_name: "kwan-tecnolog-a",
  api_key: "271917598164438",
  api_secret: "8aBtJlqNWjcKIOhqYDEqLj7WJAI"
});

module.exports = class CreateAdminUser extends Action {
  constructor() {
    super();
    this.name = "user:create";
    this.description = "A web service to register a new user";
    this.permission = "POST_USER_CREATE";
    this.middleware = ["hasOwnerScope"];
    this.inputs = {
      username: { required: true },
      email: { required: true },
      firstName: { required: false },
      lastName: { required: false },
      password: { required: true },
      verified: { required: false },
      status: { required: false },
      scopeInfo: { required: false },
      roleCode: { required: true },
      photo: { required: false }
    };
  }

  async run(data) {
    let p = data.connection.params;

    //1. EXTRACT THE SCOPE NAME FROM THE TOKEN
    const token = data.connection.rawConnection.req.headers["authorization"];
    const decodedToken = await jwt.decode(token, tokenConfig.secret);
    const scopeName = decodedToken.scope[0].scopeName;

    if (!validator.isEmail(p.email)) {
      throw new Error("Invalid email");
    }

    if (!validator.matches(p.password, regex.passwordRegex)) {
      throw new Error(
        "Your password must contain at least one uppercase letter, at least 8 characters and maximum 25. Some special characters are accepted ($&+,:;=?@#|'<>.^*()%!- )."
      );
    }

    const User = api.mongooseModels.KwanUsers_User;

    const userMatchWithEmail = await User.findOne({ email: p.email });

    const userMatchWithUsername = await User.findOne({ username: p.username });

    if (userMatchWithEmail) {
      throw new Error("Email already registered.");
    }
    if (userMatchWithUsername) {
      throw new Error("Username is already in use.");
    }

    // Hash the password.
    const password = await bcrypt.hash(p.password, 12);
    // Try to save the new user into the database.
    const user = new User();

    // user.roles.push(adminRole._id);

    user.scope.push({
      scopeName: scopeName,
      scopeInfo: p.scopeInfo,
      roleCode: p.roleCode
    });

    if (!(typeof p.photo === "undefined")) {
      // Create the avatarUrl
      let { url } = await cloudinary.uploader.upload(p.photo.path, {
        folder: "kwan-infrastructure",
        public_id: p.username
      });
      // Create a new User into the database with photo.
      user.username = p.username;
      user.email = p.email;
      user.firstName = p.firstName;
      user.lastName = p.lastName;
      user.verified = p.verified;
      user.password = password;
      user.avatarUrl = url;
    } else {
      // Create a new User into the database withou photo.
      user.username = p.username;
      user.email = p.email;
      user.firstName = p.firstName;
      user.lastName = p.lastName;
      user.verified = p.verified;
      user.password = password;
    }

    // Try to save the new user into the database.
    try {
      const result = await user.save();
      // If succesful, the response contains the next information.
      data.response = {
        newUser: result,
        message: "User succesfully created."
      };
    } catch (err) {
      throw new Error("Error saving new user to database");
    }
  }
};
