/**
 * @author {Javier Murrieta}
 * @since 01/24/2020
 */
"use strict";
const ActionHero = require("actionhero");
const actionhero = new ActionHero.Process();
require("dotenv").config();
let api;
// Mock roles
const newRole1 = {
  roleName: "TestRoleUpdate1",
  roleDescription: "Role to do test with jest Update.",
  roleCode: "TEST_SuperUpdate1",
  access: ['None']
};
/** 
 * Create connection to send params and headers
 * @return {object} connection
 * 
*/

const createConnection = async () => {
  const connection = await api.specHelper.Connection.createAsync();
  return connection;
}
/**
 * Login, returns an object with the token inside
 * @return {object} login
 */
const login = async () => {
  const loginConnection = await api.specHelper.Connection.createAsync();
  loginConnection.rawConnection.req = { headers: { system: 'CLIENT' } };
  loginConnection.params = {
    emailOrUsername: 'client',
    password: 'Urg3G42P42z'
  }
  let login = await api.specHelper.runAction(
    "auth:login",
    loginConnection
  );
  return login;
}

describe("Update role.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    const Role = api.mongooseModels.KwanUsers_Role;
    // Deletes all types created during testing
    await Role.deleteMany({ roleDescription: "Role to do test with jest Edited." });
    await actionhero.stop();
  });


  test('It Updates a role\'s name.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole1
    // Run the action
    await api.specHelper.runAction(
      "role:create",
      connection
    );

    newRole1.roleName = 'TestRoleEdited1'
    connection.params = newRole1

    let response = await api.specHelper.runAction(
      "role:update",
      connection
    );

    const { updatedRole } = response
    // Expected results
    expect(updatedRole).toBeDefined();
    expect(updatedRole.roleName).toBe(newRole1.roleName);
    expect(updatedRole.roleCode).toBe(newRole1.roleCode);
    expect(updatedRole.roleDescription).toBe(newRole1.roleDescription);
    expect(updatedRole.access.includes("None")).toBe(true);
    expect(updatedRole.permissions.length).toBe(0);
  });

  test('It Updates a role\'s access.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    newRole1.access = ['CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE']
    connection.params = newRole1

    let response = await api.specHelper.runAction(
      "role:update",
      connection
    );

    const { updatedRole } = response
    // Expected results
    expect(updatedRole).toBeDefined();
    expect(updatedRole.roleName).toBe(newRole1.roleName);
    expect(updatedRole.roleCode).toBe(newRole1.roleCode);
    expect(updatedRole.roleDescription).toBe(newRole1.roleDescription);
    expect(updatedRole.access.includes("CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE")).toBe(true);
    expect(updatedRole.permissions.length).toBeGreaterThan(0);
  });

  test('It Updates a role\'s description.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    newRole1.roleDescription = 'Role to do test with jest Edited.'
    connection.params = newRole1

    let response = await api.specHelper.runAction(
      "role:update",
      connection
    );

    const { updatedRole } = response
    // Expected results
    expect(updatedRole).toBeDefined();
    expect(updatedRole.roleName).toBe(newRole1.roleName);
    expect(updatedRole.roleCode).toBe(newRole1.roleCode);
    expect(updatedRole.roleDescription).toBe(newRole1.roleDescription);
    expect(updatedRole.access.includes("CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE")).toBe(true);
    expect(updatedRole.permissions.length).toBeGreaterThan(0);
  });
});