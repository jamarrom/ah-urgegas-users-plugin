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
    email: "test1@kwantec.com",
    firstName: 'Test1',
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

describe("Create new user.", () => {
    beforeAll(async () => {
        api = await actionhero.start();
    });

    afterAll(async () => {
        const User = api.mongooseModels.KwanUsers_User;
        // Deletes all types created during testing
        await User.deleteMany({ firstName: "Test1" });
        await actionhero.stop();
    });

    test('It Creates a new User.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser1
        // Run the action
        let response = await api.specHelper.runAction(
            "user:create",
            connection
        );
        const { newUser } = response;
        const { roleCode } = newUser.scope[0]
        // Expected results
        expect(newUser).toBeDefined();
        expect(newUser.username).toBe(newUser1.username);
        expect(newUser.email).toBe(newUser1.email);
        expect(newUser.firstName).toBe(newUser1.firstName);
        expect(newUser.lastName).toBe(newUser1.lastName);
        expect(newUser.email).toBe(newUser1.email);
        expect(roleCode).toBe(newUser1.roleCode);
    });

    test('It Fails when user already exists.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser1
        // Run the action
        let response = await api.specHelper.runAction(
            "user:create",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });

    test('It Fails when user username is missing.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        const { username, ...user } = newUser1
        connection.params = user
        // Run the action
        let response = await api.specHelper.runAction(
            "user:create",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });

    test('It Fails when user email is missing.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        const { email, ...user } = newUser1
        connection.params = user
        // Run the action
        let response = await api.specHelper.runAction(
            "user:create",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });

    test('It Fails when user password is missing.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        const { password, ...user } = newUser1
        connection.params = user
        // Run the action
        let response = await api.specHelper.runAction(
            "user:create",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });

    test('It Fails when user roleCode is missing.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        const { roleCode, ...user } = newUser1
        connection.params = user
        // Run the action
        let response = await api.specHelper.runAction(
            "user:create",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
        expect(response.error).toBe('Error: Missing required parameters');
    });
});