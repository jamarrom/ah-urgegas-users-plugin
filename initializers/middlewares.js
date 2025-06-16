/**
 * Initializer that create middlewares.
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 * @module AhUrgeGasPluginInitializers
 */
"use strict";
const { Initializer, api } = require("actionhero");
const hasOwnerScope = require("../src/middleware/hasOwnerScope");
const authenticationMiddleware = require("../src/middleware/authenticationMiddleware");

/**
 * Initializer for the middlewares of this plugin.
 * @class Middlewares
 * @extends Initializer
 */
module.exports = class Middlewares extends Initializer {
  constructor() {
    super();
    this.name = "middlewares-init";
    this.loadPriority = 9000;
  }

  async initialize() {
    //Authentication middleware
    api.actions.addMiddleware(authenticationMiddleware);

    //Permissions middleware
    api.actions.addMiddleware(hasOwnerScope);
    
  }
};
