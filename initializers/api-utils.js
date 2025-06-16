/**
 * Initializer that create utility actions on the api.
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 * @module AhUrgeGasPluginInitializers
 */
"use strict";
const { Initializer, api } = require("actionhero");
const { tokenConfig, regex } = require("../index");
const randomstring = require("randomstring");
const validator = require("validator");
const jwt = require("jsonwebtoken");

/**
 * Initializer for the utils  on the plugin.
 * @class Utils
 * @extends Initializer
 */
module.exports = class Utils extends Initializer {
  constructor() {
    super();
    this.name = "utils-init";
    this.loadPriority = 99999990;
  }

  async initialize() {
    // Error messages used on the validations.
    api.errorMessages = {
      INVALID_EMAIL: "Invalid email",
      PASSWORD_REGEX:
        "Your password must contain at least one uppercase letter, at least 8 characters and maximum 25. Some special characters are accepted ($&+,:;=?@#|<>.^*()%!- )",
      FIRSTNAME_REGEX:
        "First name cannot include numbers or special characters.",
      LASTNAME_REGEX: "Last name cannot include numbers or special characters.",
      PASSWORD_MISMATCH: "Passwords do not match."
    };

    // Error throw
    api._throw = error => {
      throw error;
    };

    // Util to validate regex.
    api.validator = {
      email: email => {
        validator.isEmail(email)
          ? true
          : api._throw(api.errorMessages.INVALID_EMAIL);
        api.log("Email is valid", "info");
      },
      passwordsMatch: (password, confirmPassword) => {
        password === confirmPassword
          ? true
          : api._throw(api.errorMessages.PASSWORD_MISMATCH);
        api.log("Passwords match", "info");
      },
      isPasswordStrong: password => {
        validator.matches(password, regex.passwordRegex)
          ? true
          : api._throw(api.errorMessages.PASSWORD_REGEX);
        api.log("Password is strong", "info");
      },
      personalNamesRegex: (firstName, lastName) => {
        validator.matches(firstName, regex.nameRegex)
          ? validator.matches(lastName, regex.nameRegex)
            ? true
            : api._throw(api.errorMessages.LASTNAME_REGEX)
          : api._throw(api.errorMessages.FIRSTNAME_REGEX);
        api.log("Names are valid", "info");
      }
    };

    // Util for decode tokens of this server with this secret
    api.decode = {
      jwt: async token => {
        return await jwt.decode(token, tokenConfig.secret);
      }
    };
    // Util for generate stuff.
    api.generate = {
      randomstring: (length, charset, capitalization) => {
        return randomstring.generate({
          length: length,
          charset: charset,
          capitalization: capitalization
        });
      }
    };
  }
};
