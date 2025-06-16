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
  roleName: "TestRoleDelete",
  roleDescription: "Role to do test with jest.",
  roleCode: "TEST_SuperDelete",
  access: ['None']
};
const newRole2 = {
  roleName: "TestRoleDelete2",
  roleDescription: "Role to do test with jest.",
  roleCode: "TEST_SuperDelete2",
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

describe("Delete role.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    const Role = api.mongooseModels.KwanUsers_Role;
    // Deletes all types created during testing
    await Role.deleteMany({ roleDescription: "Role to do test with jest." });
    await actionhero.stop();
  });

  test('It deletes a role.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole1
    // Create Role
    let newRole = await api.specHelper.runAction(
      "role:create",
      connection
    );
    let { role } = newRole
    connection.params = { payload: role._id }

    let response = await api.specHelper.runAction(
      "role:delete",
      connection
    );
    // Expected results
    expect(response.msg).toBe('delete complete');
    expect(response.body.n).toBe(1);
    expect(response.body.deletedCount).toBe(1);
  });

  test('It fails when role id is not in payload.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole1
    // Create Role
    let newRole = await api.specHelper.runAction(
      "role:create",
      connection
    );
    let { role } = newRole
    connection.params = role._id

    let response = await api.specHelper.runAction(
      "role:delete",
      connection
    );
    // Expected results
    expect(response.msg).toBe('delete complete');
    expect(response.body.n).toBe(0);
    expect(response.body.deletedCount).toBe(0);
  });

  test('It fails when role does not exists.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    connection.params = { payload: '5e2b28A02d7ee45Aba52362A' }

    let response = await api.specHelper.runAction(
      "role:delete",
      connection
    );
    // Expected results
    expect(response.msg).toBe('delete complete');
    expect(response.body.n).toBe(0);
    expect(response.body.deletedCount).toBe(0);
  });

  test('It fails with invalid token.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole2
    // Create Role
    let newRole = await api.specHelper.runAction(
      "role:create",
      connection
    );
    let { role } = newRole
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: 'Invalid token', ownerscope: 'CLIENT/Demo' } };
    connection.params = role._id

    let response = await api.specHelper.runAction(
      "role:delete",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
  });
});