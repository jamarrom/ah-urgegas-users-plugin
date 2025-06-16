/**
 * @author {Javier Murrieta}
 * @since 01/24/2020
 */
"use strict";
const ActionHero = require("actionhero");
const actionhero = new ActionHero.Process();
require("dotenv").config();
let api;
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

describe("Read modules.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
  });

  afterAll(async () => {
    // Deletes all types created during testing
    await actionhero.stop();
  });


  test('It get a list with the modules from from client.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "modules:read:all",
      connection
    );
    const {modules} = response
    // Expected results
    expect(modules).toBeDefined();
    expect(modules.length).toBe(5)
  });

  test('It get a list with the modules from from admin.', async () => {
    // Get body property from the login action
    let { body } = await login('ADMIN','Daniel')
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };

    let response = await api.specHelper.runAction(
      "modules:read:all",
      connection
    );
    const {modules} = response
    // Expected results
    expect(modules).toBeDefined();
    expect(modules.length).toBe(8)
  });

  test('It fails with invalid token.', async () => {
    // Get body property from the login action
    let { body } = await login()
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: 'invalidToken', ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "modules:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
    expect(response.body).toBeUndefined()
  });

  test('It fails with wrong scope.', async () => {
    // Get body property from the login action
    let { body } = await login('ADMIN', 'Daniel')
    // Create new connection to send to the action
    let connection = await createConnection();
    // Create the headers necessary for the action and assign params
    connection.rawConnection.req = { headers: { system: 'CLIENT', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

    let response = await api.specHelper.runAction(
      "modules:read:all",
      connection
    );
    // Expected results
    expect(response.error).toBeDefined();
    expect(response.body).toBeUndefined()
  });
});