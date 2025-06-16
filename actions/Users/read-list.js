"use strict";
const { Action, api } = require("actionhero");
module.exports = class KwanUsersGetUserAction extends Action {
  constructor() {
    super();
    this.name = "users:read:all";
    this.middleware = ["hasOwnerScope"];
    this.description = "Retrieves all users of a specified system.";
    this.permission = "GET_USER_LIST";
  }
  async run(data) {

  //   let doc = await api.mongo({
  //     action: 'READ',
  //     dbModel: 'KwanUsers_User',
  //     find: {
  //       scope: { $elemMatch: { scopeName: data.session.ownerScope } }
  //     },
  //     sort: 'createdAt',
  //     page: 1 || 0,
  //     limit: 25 || 25,
  //     populate: ''
  //   });
  //   data.response = doc;
  // }
    let doc = await api.KwanPlugin.getAdminUsers(data.session.ownerScope);
    data.response = doc;
  }
};
