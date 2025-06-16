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
  roleName: "TestRoleList1",
  roleDescription: "Role to do test with jest.",
  roleCode: "TEST_SuperList1",
  access: ['None']
};
const newRole2 = {
  roleName: "TestRoleList2",
  roleDescription: "Role to do test with jest.",
  roleCode: "TEST_SuperList2",
  access: ['None']
};
const newRole3 = {
  roleName: "TestRoleList3",
  roleDescription: "Role to do test with jest.",
  roleCode: "TEST_SuperList3",
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
const login = async (system='CLIENT', user='client') => {
  const loginConnection = await api.specHelper.Connection.createAsync();
  loginConnection.rawConnection.req = { headers: { system: system } };
  loginConnection.params = {
    emailOrUsername: user,
    password: 'Urg3G42P42z'
  }
  let login = await api.specHelper.runAction(
    "auth:login",
    loginConnection
  );
  return login;
}

describe("Read all roles.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    const Role = api.mongooseModels.KwanUsers_Role;
    // Deletes all types created during testing
    await Role.deleteMany({ roleDescription: "Role to do test with jest." });
    await actionhero.stop();
  });


  test('It get the list with the roles from the user scope.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    let originalCount = await api.specHelper.runAction(
      "roles:read:all",
      connection
    );
    const { totalDocs } = originalCount.body

    connection.params = newRole1
    // Create mock roles
    await api.specHelper.runAction(
      "role:create",
      connection
    );

    connection.params = newRole2

    await api.specHelper.runAction(
      "role:create",
      connection
    );

    connection.params = newRole3

    await api.specHelper.runAction(
      "role:create",
      connection
    );

    let response = await api.specHelper.runAction(
      "roles:read:all",
      connection
    );
    // Expected results
    expect(response.msg).toBe('success');
    expect(response.body.totalDocs).toBeGreaterThanOrEqual(3)
  });

  test('It fails with invalid token.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: 'invalidToken', ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "roles:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
    expect(response.body).toBeUndefined()
  });

  test('It gets Roles from admin.', async () => {
    // Get body property from the login action
    let { body } = await login('ADMIN', 'Daniel')
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };

    let response = await api.specHelper.runAction(
      "roles:read:all",
      connection
    );
    // Expected results
    expect(response.msg).toBe('success');
    expect(response.body.totalDocs).toBeGreaterThanOrEqual(1)
  });

  test('It fails with wrong scope.', async () => {
    // Get body property from the login action
    let { body } = await login('ADMIN', 'Daniel')
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "roles:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBeDefined();
    expect(response.body).toBeUndefined()
  });
});