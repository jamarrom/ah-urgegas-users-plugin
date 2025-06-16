"use strict";
const { Action, api } = require("actionhero");
module.exports = class GetUserAccessFromRole extends Action {
  constructor() {
    super();
    this.name = "get:user:role";
    this.description = "Returns a user's role in a specified ownerScope.";
    this.middleware = ['hasOwnerScope']
    this.permission = "GET_USER_ROLE";
  }

  async run(data) {
    let { ownerScope, _id} = data.session
    // console.log('ID del header:', _id)
    const scopes = await api.get.user.scopes({
      _id: _id,
      ownerScope: ownerScope
    });
    // console.log('SCOPES:', scopes)

    let roleCode;
    scopes.scope.map(scope => {
      if (scope.scopeName === ownerScope) {
        roleCode = scope.roleCode;
      }
    });
    // console.log('ROLE-CODE:', roleCode)
    
    const role = await api.get.role.access({
      roleCode: roleCode,
      ownerScope: ownerScope
    });
    // console.log('ROLE:', role)

    if (role.access.length >= 0) {
      data.response = {
        msg: "success",
        body: {
          access: role.access,
          roleName: role.roleName
        }
      };
    }
  }
};
