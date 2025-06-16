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
  roleName: "TestRole",
  roleDescription: "Role to do test with jest Create.",
  roleCode: "TEST_SuperCreate",
  access: ['None']
};
const newRole2 = {
  roleName: "TestRole2",
  roleDescription: "Role to do test with jest Create.",
  roleCode: "TEST_Super2Create",
  access: ['CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_LIST',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE_LIST',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_EDIT',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_DELETE'
  ]
};
const newRole3 = {
  roleName: "TestRole3",
  roleDescription: "Role to do test with jest Create.",
  roleCode: "TEST_Super3Create",
  access: ['CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_LIST',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_INVITE_LIST',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_EDIT',
    'CLIENT_EMPLOYEES/CLIENT_EMPLOYEE_DELETE'
  ]
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

describe("Create new role.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    const Role = api.mongooseModels.KwanUsers_Role;
    // Deletes all types created during testing
    await Role.deleteMany({ roleDescription: "Role to do test with jest Create." });
    await actionhero.stop();
  });


  test('It Creates a role with no access.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole1
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    let { role } = response
    // Expected results
    expect(role.access).toBeDefined();
    expect(role._id).toBeDefined();
    expect(role.roleName).toBe(newRole1.roleName);
    expect(role.roleCode).toBe(newRole1.roleCode);
    expect(role.roleDescription).toBe(newRole1.roleDescription);
    expect(role.access.includes("None")).toEqual(true);
    expect(role.permissions.length).toBe(0);
    expect(role.ownerScope).toBe('CLIENT/Demo');
  });

  test('It Creates a role with access to 5 features.', async () => {
    // Get body property from the login action
    let { body } = await login();
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole2
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    let { role } = response
    // Expected results
    expect(role.access).toBeDefined();
    expect(role._id).toBeDefined();
    expect(role.roleName).toBe(newRole2.roleName);
    expect(role.roleCode).toBe(newRole2.roleCode);
    expect(role.roleDescription).toBe(newRole2.roleDescription);
    expect(role.access.includes("None")).toEqual(false);
    expect(role.permissions.length).toBeGreaterThan(0);
    expect(role.ownerScope).toBe('CLIENT/Demo');
  });

  test('It Fails with invalid token', async () => {
    // Get body property from the login action
    let { body } = await login();
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: 'invalidToken', ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole2
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
  });

  test('It Fails when role already exists', async () => {
    // Get body property from the login action
    let { body } = await login();
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    connection.params = newRole1
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Role already exists.');
  });

  test('It Fails when role name missing', async () => {
    // Get body property from the login action
    let { body } = await login();
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    let {roleName, ...role} = newRole3
    connection.params = role
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Missing required parameters');
  });

  test('It Fails when role code is missing', async () => {
    // Get body property from the login action
    let { body } = await login();
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    let {roleCode, ...role} = newRole3
    connection.params = role
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Missing required parameters');
  });

  test('It Fails when access is missing', async () => {
    // Get body property from the login action
    let { body } = await login();
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };
    let {access, ...role} = newRole3
    connection.params = role
    // Run the action
    let response = await api.specHelper.runAction(
      "role:create",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Missing required parameters');
  });
});