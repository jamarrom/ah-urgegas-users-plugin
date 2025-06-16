"use strict";
const { Action, api } = require("actionhero");

module.exports = class ReadSMF extends Action {
  constructor() {
    super();
    this.name = "smf:read:all";
    this.description = "retrieves a feature for a specific System Module";
    this.middleware = ["hasOwnerScope"];
    this.permission = "GET_SMF_LIST";
  }
  async run(data) {
    const SMF = api.mongooseModels.KwanUsers_SMF;
    const System = api.mongooseModels.KwanUsers_System;
    const ownerScope = data.connection.rawConnection.req.headers["ownerscope"];
    // const code = ownerScope.split("/")[0];
    const code = data.connection.rawConnection.req.headers["system"]

    try {
      const system = await System.findOne({ code: code });
      if (!system) {
        throw new Error("System not found");
      }
      let systemModuleFeatures = await SMF.find({
        systemId: system._id
      });
      data.response.SMF = systemModuleFeatures;
      //POPULATE THE SYSTEMID FIELD
    } catch (err) {
      console.log("No SMF found!");
      console.log(JSON.stringify(err, null, 2));
      throw new Error("Error querying module from database");
    }
  }
};
