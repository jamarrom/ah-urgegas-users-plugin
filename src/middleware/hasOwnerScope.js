const { api } = require("actionhero");
const { scopes } = require("../../index");

module.exports = {
  name: "hasOwnerScope",
  global: false,
  priority: 1000,
  preProcessor: async data => {
    let hasOwnerScope = false;
    const ownerScope = data.connection.rawConnection.req.headers.ownerscope;
    const token = data.connection.rawConnection.req.headers.authorization;
    const decoded = await api.decode.jwt(token);
    const userScopes = await api.get.user.scopes(decoded._id);
    const template = data.actionTemplate.permission;
    // console.log('---------------------------- ownerScope');
    // console.log(ownerScope);
    // console.log('----------------------------');
    // console.log(token);
    // console.log(decoded);
    // console.log('----------------------------');
    // console.log(userScopes);
    // console.log('----------------------------');
    // console.log(template);
    if (userScopes !== null) {
      let roleCode;
      userScopes.scope.map(scope => {
        if (scope.scopeName === ownerScope) {
          roleCode = scope.roleCode;
        }
      });
      // console.log('---------------------------- code');
      // console.log(roleCode)
      hasOwnerScope = scopes.hasAccess(decoded.scope, ownerScope, 1);
      if (!hasOwnerScope || !ownerScope) {
        throw new Error("You don't have access to this owner scope.");
      } else {
        const {permissions, roleName} = await api.get.role.permissions({
          roleCode: roleCode,
          ownerScope: ownerScope
        });
        // console.log('there are permissions');
        // console.log(permissions);
        let permissionsFormatted = permissions.map(p => {
          if(p.includes(template)){
            return true;
          }
          return false;
        })
        data.response = {
          access: hasOwnerScope
        };
        data.session = {
          ownerScope: ownerScope,
          _id: decoded._id,
          permissions: permissionsFormatted,
          roleName: roleName
        };
      }
    } else {
      throw "Acess Denied";
    }
  }
};
