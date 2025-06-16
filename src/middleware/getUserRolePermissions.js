const { api } = require("actionhero");

module.exports = {
  name: "hasPermissionsMiddleware",
  global: false,
  priority: 1000,
  preProcessor: async (data) => {

    console.log('hasPermissionsMiddleware is preprocessing the request');

    const token = data.connection.rawConnection.req.headers.authorization;

    const permissions = api.get.role.permissions({
      roleCode: '',
      ownerScope: '',
    })

    const scope = data.params.scope;
    // const scope = 'admin/franquicia1';
    const username = data.params.username;
    // const username = 'carlosz92';
    const permissionType = data.params.permissionType;
    // const permissionType = 'UI';
    const permissionCode = data.params.permissionCode;
    // const permissionCode = 'GET_PRODUCT_LIST';
    const activeScope = data.params.activeScope;
    let userHasPermission;

    const User = api.mongooseModels.KwanUsers_User;
    const Role = api.mongooseModels.KwanUsers_Role;

    let userFound = await User.findOne({ username: username })

    if (userFound) {
      console.log("hasPermissionsMiddleware says: User found!")
      const userScopes = await User.findOne({ username: username }).select('scope');
      const availableUserScopes = userScopes.scope;

      console.log("user scopes:")
      console.log(availableUserScopes)

      console.log("Looking for scope:");
      console.log(scope);

      const userScopeRoleCode = availableUserScopes.map(elem => {
        if (elem.scopeName === scope) {
          console.log("scope found!")
          return elem.roleCode
        }
        console.log('hasPermissionsMiddleware says: Scope not found in user:')
        console.log(username)
        return false
      });

      if (userScopeRoleCode) {
        console.log('hasPermissionsMiddleware says: Scope has role:')
        console.log(userScopeRoleCode);
        console.log("checking the role schema for role permissions:")
        const rolePermissions = await Role.findOne({ roleCode: userScopeRoleCode[0] }).select('permissions');
        console.log("Role permissions")
        console.log(rolePermissions.permissions)
        const availableRolePermissions = rolePermissions.permissions;
        userHasPermission = availableRolePermissions.map(elem => {
          if (elem.permissionType === permissionType) {
            if (elem.permissionCode === permissionCode) {
              console.log('hasPermissionsMiddleware says: USER ACCESS GRANTED')
              return true
            }
          }
          console.log('hasPermissionsMiddleware says: NO PERMISSIONS MATCH THE ROLE')
          return false
        });
      }
      else {
        console.log('hasPermissionsMiddleware says: User has no role.')
        throw new Error("USER PERMISSION DENIED");
      }
    }
    else {
      console.log("hasPermissionsMiddleware says: User not found")
    }
    if (userHasPermission) {
      return true
    }
    else {
      console.log("hasPermissionsMiddleware says: USER PERMISSION DENIED");
      throw new Error("USER PERMISSION DENIED");
    }
  }
};
    //syscode + ownercode = scope
    //hasPermissions('admin/franquicia1',username,type,permissionCode)