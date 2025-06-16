/**
 * Scope util from plugin: reutilizable functions which 
 * returns values about scopes.
 * @module Scopes
 * @version 1.0.0.
 * @author [Javier Murrieta](https://gitlab.com/jmurrieta)
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 */

/**
 * Return all the scopeNames give an scope array.
 * @param {Array} scope - The scope from an user.
 * @function getAllScopeNames
 * @exports getAllScopeNames
 */
exports.getAllScopeNames = scope => {
  let scopeNames = [];
  for (scopeModule in scope) {
    scopeNames.push(scope[scopeModule].scopeName.toString());
  }
  return scopeNames;
};

/**
 * Return if a user has acces by scope.
 * @param {Array} userScope - The scope array of the user.
 * @param {String} expectedScope - The scope that we expected.
 */
exports.hasAccess = (userScope, expectedScope, flag = 0) => {
  for (let i = 0; i < userScope.length; i++) {
    if (userScope[i].scopeName.split('/')[flag].toLowerCase() === expectedScope.split('/')[flag].toLocaleLowerCase()) {
      return (hasAccess = true);
    }
  }
  return false;
};

/**
 * A function to cretate a scope name, client or admin.
 * @param {String} system - The system, can be client or admin.
 * @param {String} owner - The code identifier of the company. 
 * @function createScopeNameByOwner
 */
exports.createScopeNameByOwner = (system, owner) => {
  return `${system}/${owner}`;
}

/**
 * A function to cretate a scope name, client or admin.
 * @param {String} owner - The name of the company.
 * @function createCodeByOwner
 */
exports.createCodeByOwner = (owner) => {
  return owner.replace(/ /g, "").toLowerCase();
}
