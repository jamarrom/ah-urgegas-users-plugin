"use strict";
const { Action, api } = require("actionhero");
module.exports = class KwanUsersGetUserAction extends Action {
  constructor() {
    super();
    this.name = "users:read";
    this.description = "A web service to get an specific user.";
    this.middleware = ["hasOwnerScope"];
    this.inputs = {
      username: { required: true }
    };
    this.permission = 'GET_USER_LIST'
  }

  async run({ params, response }) {
    const username = params.username;

    const User = api.mongooseModels.KwanUsers_User;

    const user = await User.findOne({ username: username });

    if (!user) {
      throw new Error("That user not exists.");
    }

    response.data = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl
      }
    };
  }
};