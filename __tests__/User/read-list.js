/**
 * @author {Javier Murrieta}
 * @since 01/27/2020
 */
"use strict";
const ActionHero = require("actionhero");
const actionhero = new ActionHero.Process();
require("dotenv").config();
let api;
// Mock roles
const newUser1 = {
  username: "TestUser1",
  email: "testRead1@kwantec.com",
  firstName: 'TestRead1',
  lastName: 'Test1',
  password: "A12345678",
  roleCode: 'CLIENT_Super',
};
const newUser2 = {
  username: "TestUser2",
  email: "testRead2@kwantec.com",
  firstName: 'TestRead1',
  lastName: 'Test1',
  password: "A12345678",
  roleCode: 'CLIENT_Super',
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
const login = async (system = 'CLIENT', user = 'client') => {
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

describe("List users.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    const User = api.mongooseModels.KwanUsers_User;
    // Deletes all types created during testing
    await User.deleteMany({ firstName: "TestRead1" });
    await actionhero.stop();
  });


  test('It reads all users from CLIENT.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    const response = await api.specHelper.runAction(
      "users:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: PERMISSIONS DENIED');
  });

  test('It reads all users from ADMIN.', async () => {
    // Get body property from the login action
    let { body } = await login('ADMIN', 'Daniel')
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };

    const response = await api.specHelper.runAction(
      "users:read:all",
      connection
    );
    // Expected results
    expect(response.length).toBeGreaterThanOrEqual(1);
  });

  test('It fails with invalid token', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: 'InvalidToken', ownerscope: 'CLIENT/Demo' } };

    const response = await api.specHelper.runAction(
      "users:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBeDefined();
    expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
  });
});