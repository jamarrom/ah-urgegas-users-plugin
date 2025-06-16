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

describe("Get user Access from Role.", () => {
    beforeAll(async () => {
        api = await actionhero.start();
    });

    afterAll(async () => {
        const User = api.mongooseModels.KwanUsers_User;
        // Deletes all types created during testing
        await User.deleteMany({ firstName: "Test1" });
        await actionhero.stop();
    });

    test('Gets users role access.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        // Run the action
        let response = await api.specHelper.runAction(
            "get:user:role",
            connection
        );
        let {access, roleName} = response.body
        // Expected results
        expect(response.msg).toBe('success');
        expect(roleName).toBe('SuperAdmin');
        expect(access).toBeDefined();
        expect(access.length).toBe(30);
    });

    test('Gets fails with invalid token.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: 'invalidtoken', ownerscope: 'ADMIN/Main' } };
        // Run the action
        let response = await api.specHelper.runAction(
            "get:user:role",
            connection
        );
        // Expected results
        expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
    });

    test('Gets fails with invalid scope.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'OWNER/Demo' } };
        // Run the action
        let response = await api.specHelper.runAction(
            "get:user:role",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });

    test('Gets fails when scope does not belongs to user.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'OWNER/Demo' } };
        // Run the action
        let response = await api.specHelper.runAction(
            "get:user:role",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });
});