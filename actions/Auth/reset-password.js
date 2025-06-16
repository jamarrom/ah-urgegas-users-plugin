"use strict";
const { Action, api } = require("actionhero");
const jwt = require("jsonwebtoken");
const { transporter, tokenConfig } = require("../../index");

/**
 * Action to reset the user password given a new password.
 * @version 1.0.0.
 * @class ResetPassword
 * @extends Action
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 */
module.exports = class ResetPassword extends Action {
  constructor() {
    super();
    this.name = "auth:password:reset";
    this.description = "User will reset it password.";
    this.inputs = {
      _id: { required: true },
      password: { required: true },
      confirmPassword: { required: true }
    };
  }

  async run(data) {
    const params = data.connection.params;
    let { password, confirmPassword, _id } = params;

    // Validate if the password is strong enough.
    // In case the password isn't strong enough, throw an error.
    api.validator.isPasswordStrong(password);

    // Validate the password and the confirm password for security.
    // In case the passwords don't match, throw an error.
    api.validator.passwordsMatch(password, confirmPassword);

    // Then, update the user with the new password
    // This method auto-hash the password before update.
    // Temporal pass field is not more required, so toggle it's value to null.
    api.KwanPlugin.update({
      model: "KwanUsers_User",
      values: {
        _id: _id,
        password: password,
        temporalPassword: null
      }
    });

    // Find the user to handle emailOrUsername.
    const user = await api.KwanPlugin.read({
      model: "KwanUsers_User",
      column: "_id",
      value: _id
    });

    // Send an email to the user to inform that it password has been changed.
    if(!params.test){
    
      try {
        await transporter.sendMail({
          to: user.body.email,
          from: "UrgeGas <hello@urgegas.com>",
          subject: "Password changed.",
          html: `<div>
          Hello. 
          <br> Your password has been changed, if you don't know this action, please contact us.
          <br> For security, consider save your password on a password manager.
          <br> <strong>See you!</strong>
          <br> <small>- UrgeGas Administration</small>
          </div>`
        });
      } catch (error) {
        throw Error("Error reseting the password. CODE: R001");
      }
    }

    // Login credentials provided
    const secureUser = {
      _id: user.body._id,
      firstName: user.body.firstName,
      lastName: user.body.lastName,
      username: user.body.username,
      email: user.body.email,
      scope: user.body.scope,
      avatarUrl: user.body.avatarUrl
    };

    const token = jwt.sign(secureUser, tokenConfig.secret, {
      expiresIn: tokenConfig.tokenLife
    });

    const refreshToken = jwt.sign(secureUser, tokenConfig.secret, {
      expiresIn: tokenConfig.tokenLongestLife
    });

    data.response = {
      body: {
        token: token,
        refreshToken: refreshToken,
        user: secureUser
      },
      msg: "Login succesfully."
    };
  }
};
