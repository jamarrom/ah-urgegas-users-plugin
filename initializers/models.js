/**
 * Initializer from set to actionhero 'api' a reference to users models into another actionhero project. 
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 * @module AhUrgeGasPluginInitializers
 */
"use strict";
const { Initializer, api } = require("actionhero");
//const databaseURL = "mongodb://localhost:27017/mydb";
const mongoose = require("mongoose");
const KwanModels = require("../src/models/kwan-models/kwan-users-plugin_mongo_models");

/**
 * Initializer for mongoose schemas of this plugin.
 * @class Models
 * @extends Initializer
 */
module.exports = class Models extends Initializer {
  constructor() {
    super();
    this.name = "plugin-models-init";
    this.loadPriority = 1;
  }

  async initialize() {

    if (typeof api.mongooseConnection === "undefined") {

      let databaseURL = null;

      if (typeof process.env.DB_URL === "undefined") {
        // TODO remove this and throw error
        databaseURL = "mongodb://localhost:27017/mydb";
        //throw new Error("No DB_URL provided");
      }else{
        databaseURL = process.env.DB_URL;
      }

      console.log("Connecting from Users plugin to database: " + databaseURL);

      try {
        let connection = await mongoose.connect(databaseURL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
        });
        api.mongooseConnection = connection;
      } catch (error) {
        throw new Error("Error connecting to database: " + databaseURL);
      }
    }

    
    if (typeof api.mongooseModels === "undefined") {
      api.mongooseModels = {};
    }

    api.mongooseModels = {
      KwanUsers_User: KwanModels.User,
      KwanUsers_System: KwanModels.System,
      KwanUsers_Role: KwanModels.Role,
      KwanUsers_SMF: KwanModels.Feature,
    };
  }
};