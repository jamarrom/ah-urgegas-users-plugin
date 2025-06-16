'use strict'
const { Action, api } = require('actionhero')

module.exports = class RoleReadAll extends Action {
  constructor() {
    super();
    this.name = "roles:read:all";
    this.permission = 'GET_ROLE_LIST'
    this.description = "Lists all the available roles by ownerScope";
    this.middleware = ["hasOwnerScope"];
  }
  async run(data) {
    const doc = await api.KwanPlugin.readAll({
      model: "KwanUsers_Role",
      column: "ownerScope",
      value: data.session.ownerScope,
      options: {
        page: 1,
        limit: 1500
      }
    });
    data.response = doc;
  }
};