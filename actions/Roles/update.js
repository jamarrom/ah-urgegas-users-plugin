"use strict";
const { Action, api } = require("actionhero");

module.exports = class UpdateRole extends Action {
  constructor() {
    super();
    this.name = "role:update";
    this.description = "edits a role";
    this.middleware = ["hasOwnerScope"];
    this.permission = 'PUT_ROLE_UPDATE'
    this.inputs = {
      roleName: { required: true },
      roleDescription: { required: false },
      roleCode: { required: true },
      access: { required: true }
    };
  }

  async run(data) {
    const Role = api.mongooseModels.KwanUsers_Role;
    const SMF = api.mongooseModels.KwanUsers_SMF;
    let params = data.connection.params;
    const ownerScope = data.connection.rawConnection.req.headers["ownerscope"];
    try {
      let role = await Role.findOne({ roleCode: params.roleCode });
      if (!role) {
        throw new Error("Role not found");
      }

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

      role.roleName = params.roleName;
      role.ownerScope = ownerScope;
      role.roleDescription = params.roleDescription;
      role.access = params.access;
      role.permissions = permArray;

      await role.save();

      data.response.updatedRole = role;
    } catch (err) {
      throw new Error("Error updating role.");
    }
  }
};
