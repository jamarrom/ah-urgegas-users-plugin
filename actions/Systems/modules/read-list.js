"use strict";
const { Action, api } = require("actionhero");
const { scopes } = require("../../../index");
module.exports = class ReadModules extends Action {
  constructor() {
    super();
    this.name = "modules:read:all";
    this.middleware = ["hasOwnerScope"];
    this.description = "Web service to read all the Modules.";
    this.permission = "GET_MODULE_LIST";
  }

  async run(data) {
    const System = api.mongooseModels.KwanUsers_System;
    const ownerScope = data.connection.rawConnection.req.headers["ownerscope"];

    const code = data.connection.rawConnection.req.headers["system"]
    try {
      const system = await System.findOne({ code: code });
      if (!system) {
        throw new Error("System not found");
      }

      data.response = {
        modules: system.modules
      };
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      throw new Error("Error getting the modules");
    }
  }
};
