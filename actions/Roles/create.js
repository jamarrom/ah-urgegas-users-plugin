"use strict";
const { Action, api } = require("actionhero");

module.exports = class RoleAction extends Action {
  constructor() {
    super();
    this.name = "role:create";
    this.description = "Creates a new role";
    this.permission = 'POST_ROLE_CREATE'
    this.middleware = ["hasOwnerScope"];
    this.inputs = {
      roleName: { required: true },
      roleDescription: { required: false },
      roleCode: { required: true },
      access: { required: true },
    };
  }

  async run(data) {
    // your logic here
    const Role = api.mongooseModels.KwanUsers_Role;
    const SMF = api.mongooseModels.KwanUsers_SMF;

    const newRole = new Role();
    const ownerScope = data.connection.rawConnection.req.headers["ownerscope"];
    let params = data.connection.params;
    
    newRole.roleName = params.roleName;
    newRole.roleDescription = params.roleDescription;
    newRole.roleCode = params.roleCode;
    newRole.ownerScope = ownerScope;
    newRole.access = params.access;

    // Fill the permissions array with the permission codes of each the feature
    let permArray = [];

    if (!params.access.includes('None')) {
      for (let i = 0; i < params.access.length; i++) {
        //Get the feature code from access
        let featureCode = params.access[i].split('/')[1];
        // Get the feature from DB
        let smf = await SMF.findOne({ featureCode: featureCode })
        for (let j = 0; j < smf.permissions.length; j++) {
          // Condition to prevent duplicated permission codes
          if (!permArray.includes(smf.permissions[j].code)) {
            permArray.push(smf.permissions[j].code);
          }
        }
      }
    }

    if(ownerScope.includes("CLIENT")){
      permArray.push('GET_PROVIDER')
    }
    permArray.push('GET_USER_ROLE')
    newRole.permissions = permArray;

    try {
      let savedRole = await newRole.save();
      data.response.role = savedRole;
      data.response.role.id = savedRole._id;
      data.response.role.roleName = savedRole.roleName;
      data.response.role.ownerScope = savedRole.ownerScope;
      data.response.role.access = savedRole.access;
      data.response.role.permissions = savedRole.permissions;
    } catch (err) {
      api.log("Error creating a new role.");
      if (err.code === 11000) {
        throw new Error("Role already exists.");
      }
      throw new Error("Error saving role into database." + err);
    }
  }
};
