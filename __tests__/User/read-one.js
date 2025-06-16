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
    username: "TestReadOneUser1",
    email: "testReadOne1@kwantec.com",
    firstName: 'TestReadOne1',
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

describe("Read one user.", () => {
    beforeAll(async () => {
        api = await actionhero.start();
    });

    afterAll(async () => {
        const User = api.mongooseModels.KwanUsers_User;
        // Deletes all types created during testing
        await User.deleteMany({ firstName: "TestReadOne1" });
        await actionhero.stop();
    });


    test('It reads a single user.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser1
        await api.specHelper.runAction(
            "user:create",
            connection
        );

        connection.params = { username: newUser1.username }
        const response = await api.specHelper.runAction(
            "users:read",
            connection
        );
        const { user } = response.data
        // Expected results
        expect(user).toBeDefined();
        expect(user.username).toBe(newUser1.username);
        expect(user.email).toBe(newUser1.email);
        expect(user.firstName).toBe(newUser1.firstName);
    });

    test('It fails with invalid token.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: 'invalid_token', ownerscope: 'ADMIN/Main' } };

        connection.params = { username: newUser1.username }
        const response = await api.specHelper.runAction(
            "users:read",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
        expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
    });

    test('It fails with invalid scope.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

        connection.params = { username: newUser1.username }
        const response = await api.specHelper.runAction(
            "users:read",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
        expect(response.error).toBe('Error: You don\'t have access to this owner scope.');
    });

    test('It fails when user does not exists.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'CLIENT/Demo' } };

        connection.params = { username: 'NoTestUser' }
        const response = await api.specHelper.runAction(
            "users:read",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });
});