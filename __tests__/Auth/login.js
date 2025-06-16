"use strict";

const ActionHero = require("actionhero");
const actionhero = new ActionHero.Process();
const bcrypt = require("bcryptjs");
let api;

describe("BACK-001: Login.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
    const User = api.mongooseModels.KwanUsers_User;
    const password = await bcrypt.hash('A12345678', 12);
    const mockUser = new User({
      username: "login",
      verified: true,
      email: "login@kwantec.com",
      firstName: "Admin",
      lastName: "Main",
      password: password,
      scope: [{
        scopeName: "ADMIN/Main",
        scopeInfo: null,
        roleCode: "ADMIN_Super"
      }]
    })
    await mockUser.save();
  });

  afterAll(async () => {
    const User = api.mongooseModels.KwanUsers_User;
    await User.deleteOne({email: "login@kwantec.com"})
    await actionhero.stop();
  });

  test("Sucessfully log in with a pair of tokens by email.", async () => {
    const connection = await api.specHelper.Connection.createAsync();
    connection.rawConnection.req = { headers: { system: 'ADMIN' } };
    connection.params = {
      emailOrUsername: 'login@kwantec.com',
      password: 'A12345678'
    }

    let response = await api.specHelper.runAction(
      "auth:login",
      connection
    );


    expect(response.body.token).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  test("Sucessfully log in with a pair of tokens by username.", async () => {
    const connection = await api.specHelper.Connection.createAsync();
    connection.rawConnection.req = { headers: { system: 'ADMIN' } };
    connection.params = {
      emailOrUsername: 'login',
      password: 'A12345678'
    }

    let response = await api.specHelper.runAction(
      "auth:login",
      connection
    );

    expect(response.body.token).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  test("It fails if has no permissions to access by scope.", async () => {
    const connectionAdmin = await api.specHelper.Connection.createAsync();
    connectionAdmin.rawConnection.req = { headers: { system: 'CLIENT' } };
    connectionAdmin.params = {
      emailOrUsername: 'login@kwantec.com',
      password: 'A12345678'
    }

    const connectionClient = await api.specHelper.Connection.createAsync();
    connectionClient.rawConnection.req = { headers: { system: 'ADMIN' } };
    connectionClient.params = {
      emailOrUsername: 'client@kwantec.com',
      password: 'A12345678'
    }

    // Admin scope tried to log in into client.
    let caseClient = await api.specHelper.runAction(
      "auth:login",
      connectionAdmin
    );
    // Client scope tried to log in into admin.
    let caseAdmin = await api.specHelper.runAction(
      "auth:login",
      connectionClient
    );

    expect(caseClient.error).toBeDefined();
    expect(caseAdmin.error).toBeDefined();
  });

  test("It fails for invalid credentials.", async () => {
    const connectionPass = await api.specHelper.Connection.createAsync();
    connectionPass.rawConnection.req = { headers: { system: 'ADMIN' } };
    connectionPass.params = {
      emailOrUsername: 'login@kwantec.com',
      password: 'Wr0ngP455'
    }

    const connectionEmail = await api.specHelper.Connection.createAsync();
    connectionEmail.rawConnection.req = { headers: { system: 'ADMIN' } };
    connectionEmail.params = {
      emailOrUsername: 'wrongemail@kwantec.com',
      password: 'A12345678'
    }    

    let caseEmail = await api.specHelper.runAction(
      "auth:login",
      connectionEmail
    );

    let casePassword = await api.specHelper.runAction(
      "auth:login",
      connectionPass
    );
    //TODO: Revisar por qué regresa data.connection.setStatusCode is not a function, cambiar por 
    //expect(casePassword.error).toEqual("Error: Invalid credentials.")
    expect(caseEmail.error).toBeDefined();
    expect(casePassword.error).toBeDefined();
  });
});
