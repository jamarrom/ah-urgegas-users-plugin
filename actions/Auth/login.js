"use strict";
const { Action, api } = require("actionhero");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { tokenConfig, scopes } = require("../../index");

/**
 * Web service to login users by email or username.
 * @version 1.0.0.
 * @class Login
 * @extends Action
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 */
module.exports = class Login extends Action {
  constructor() {
    super();
    this.name = "auth:login";
    this.description =
      "Provides login credentials (token) for a registered user on KwanModels_Users.";
    this.inputs = {
      emailOrUsername: { required: true },
      password: { required: true }
    };
  }

  outputExample() {
    return {
      data: {
        token: "A JSONWebToken with one day of expiration",
        refreshToken: "A JSONWebToken, but with more time at expiration date."
      }
    };
  }

  async run(data) {
    let params = data.connection.params;
    const User = api.mongooseModels.KwanUsers_User;
    const system = data.connection.rawConnection.req.headers["system"];
    try {
      /** Find the username by email and username  */
      const userWithEmail = await User.aggregate([
        {
          '$match': {
            'email': params.emailOrUsername.trim()
          }
        }, {
          '$unwind': {
            'path': '$scope'
          }
        }, {
          '$lookup': {
            'from': 'providers', 
            'localField': 'scope.scopeName', 
            'foreignField': 'ownerScope', 
            'as': 'provider'
          }
        }, {
          '$addFields': {
            'provider': {
              '$arrayElemAt': [
                '$provider', 0
              ]
            }
          }
        }
      ])

      const userWithUsername = await User.aggregate([
        {
          '$match': {
            'username': params.emailOrUsername.trim()
          }
        }, {
          '$unwind': {
            'path': '$scope'
          }
        }, {
          '$lookup': {
            'from': 'providers', 
            'localField': 'scope.scopeName', 
            'foreignField': 'ownerScope', 
            'as': 'provider'
          }
        }, {
          '$addFields': {
            'provider': {
              '$arrayElemAt': [
                '$provider', 0
              ]
            }
          }
        }
      ])

      // console.log('userWithEmail');
      // console.log(userWithEmail);
      // console.log('userWithUsername');
      // console.log(userWithUsername);

      /**
       * If both user references are null, end the flow.
       */
      if (!userWithEmail && !userWithUsername) {
        /**
         * To notify on backend if it was for email.
         */
        if (!userWithEmail) {
          api.log("No user with that email found.");
        }
        /**
         * To notify on backend if was for username.
         */
        if (!userWithUsername) {
          api.log("No user with that username found.");
        }
        /**
         * Error on response for client.
         */
        data.connection.setStatusCode(400);
        throw new Error("Invalid credentials.");
      }

      /**
       * let a new user references that will be used on the next steps.
       */
      let user;

      /**
       * If the username was found by usnername, asign that refence to our reference.
       */
      if (userWithUsername !== null && userWithUsername[0]) {
        user = userWithUsername[0];
      }
      /**
       * Also, verify if it was found by email and repeat.
       */
      if (userWithEmail !== null && userWithEmail[0]) {
        user = userWithEmail[0];
      }
      /**
       * Verify if the user scope system is the same that the current system (CLIENT/ADMIN).
       */
      // hasAccess function wants scope as array, so...
      user.scope = [{...user.scope}]
      let access = scopes.hasAccess(user.scope, system);
      if (!access) {
        api.log("Access denied", "warning");
        data.connection.setStatusCode(401);
        throw new Error("Access denied.");
      }

      // If user is verified, do the normal login
      if (user.verified) {
        const isEqual = await bcrypt.compare(params.password, user.password);
        const isEqualToTemporalPassword =
          user.temporalPassword !== null
            ? await bcrypt.compare(params.password, user.temporalPassword)
            : false;

        if (!isEqual && !isEqualToTemporalPassword) {
          data.connection.setStatusCode(401);
          throw new Error("Invalid credentials.");
        }

        // Add verification if user has an active provider
        if (user.provider && user.provider.status && user.provider.status === 'suspended') {
          console.log('ENTRA A SUSPENDED')
          api.log("Provider suspended")
          data.connection.setStatusCode(401)
          throw new Error("Acced denied, provider Suspended")
        }

        /**
         * Verify if the user has a temporal password to force reset it password.
         */
        if (user.temporalPassword !== null) {
          api.log("User needs to reset it password.", "notice");
          data.response = {
            body: {
              needReset: true,
              _id: user._id
            },
            msg: "User need to reset it's password"
          };
        } else {
          //Select info sent inside the token
          const secureUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            scope: user.scope,
            avatarUrl: user.avatarUrl
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
      } else {
        //Else, tell to the Front end to move at access code page.
        api.log("User need verify it account");
        data.response = {
          body: {
            needCode: true
          },
          msg: "User needs to verify it account"
        };
      }
    } catch (e) {
      throw e;
    }
  }
};
