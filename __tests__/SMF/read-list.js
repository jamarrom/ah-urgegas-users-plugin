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
const newRole1 = {
  roleName: "TestRoleList1",
  roleDescription: "Role to do test with jest.",
  roleCode: "TEST_SuperList1",
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

describe("Read all features.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    // Deletes all types created during testing
    await actionhero.stop();
  });


  test('It get the list with the roles from the user scope (Client).', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "smf:read:all",
      connection
    );
    const {SMF} = response
    // Expected results
    expect(SMF.length).toBe(19);
  });

  test('It get the list with the roles from the user scope (Admin).', async () => {
    // Get body property from the login action
    let { body } = await login('ADMIN', 'Daniel')
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };

    let {SMF} = await api.specHelper.runAction(
      "smf:read:all",
      connection
    );
    // Expected results
    expect(SMF.length).toBe(30);
  });

  test('It fails with invalid token.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: 'InvalidToken', ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "smf:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
  });

  test('It fails with invalid scope.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'ADMIN/Main' } };

    let response = await api.specHelper.runAction(
      "smf:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: You don\'t have access to this owner scope.');
  });
});