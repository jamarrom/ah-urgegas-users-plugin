"use strict";
const { Action, api } = require("actionhero");
const jwt = require("jsonwebtoken");
const { tokenConfig } = require("../../index");
/**
 * Web service to verify is a token is valid.
 * @version 1.0.0.
 * @class VerifyAuthentication
 * @extends Action
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 * @author [Jude Sanon](https://gitlab.com/jsanon)
 */
module.exports = class VerifyAuthentication extends Action {
  constructor() {
    super();
    this.name = "auth:verify";
    this.description = "Check if users is auth";
    this.inputs = {
      token: { required: true }
    };
  }
  outputExample() {
    return {
      auth: true,
      username: "charlintosh"
    };
  }
  async run(data) {
    let params = data.connection.params;
    const token = params.token;
    if (typeof token === "undefined" || token === null || token === "null") {
      data.response = {
        auth: false
      };
    } else {
      try {
        jwt.verify(token, tokenConfig.secret);
      } catch (e) {
        if (e.name === "TokenExpiredError") {
          throw new Error("Token expired.");
        }
        throw new Error("Token invalid.");
      } finally {
        data.response = {
          auth: false
        };
      }
      let decoded = await jwt.decode(params.token, tokenConfig.secret);
      data.response = {
        auth: true,
        username: decoded.username
      };
    }
  }
};