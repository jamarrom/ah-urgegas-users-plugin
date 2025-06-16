/**
 * Initializer thhat inject routes into another actionhero project.
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 * @module AhUrgeGasPluginInitializers
 */
"use strict";
const { Initializer, api } = require("actionhero");

/**
 * Initializer for the routes of this plugin.
 * @class RouteInjection
 * @extends Initializer
 */
module.exports = class RouteInjection extends Initializer {
  constructor() {
    super();
    /** @private */
    this.name = "ah-urgegas-users-plugin";
    /** @private */
    this.loadPriority = 2000;
  }

  async initialize() {
    /**  Route injection */
    /**  GET */
    // Roles
    api.routes.registerRoute("get", "roles/all", "roles:read:all");
    // Modules
    api.routes.registerRoute("get", "modules/all", "modules:read:all");
    // SMF
    api.routes.registerRoute(
      "get",
      "system/modules/features/all",
      "smf:read:all"
    );

    // Users
    api.routes.registerRoute("get", "users/read/all", "users:read:all");
    api.routes.registerRoute("get", "users", "users:read");
    api.routes.registerRoute("get", "users/search", "user:search");
    api.routes.registerRoute("get", "users/role/access", "get:user:role");

    // POST.
    // Auth.
    api.routes.registerRoute("post", "auth/verify", "auth:verify");
    api.routes.registerRoute("post", "auth/login", "auth:login");
    api.routes.registerRoute("post", "auth/password", "auth:password:recover");
    api.routes.registerRoute("post", "auth/reset", "auth:password:reset");
    // Users
    api.routes.registerRoute("post", "users/create", "user:create");
    // Roles
    api.routes.registerRoute("post", "roles", "role:create");

    // PUT.
    // Users.
    api.routes.registerRoute("put", "users/role", "users:update:rol")
    api.routes.registerRoute("put", "users", "users:update");
    api.routes.registerRoute("put", "role", "role:update");

    //DELETE:
    // Roles
    api.routes.registerRoute("delete", "role", "role:delete");
    api.routes.registerRoute("delete", "user", "delete:user");
  }
};
