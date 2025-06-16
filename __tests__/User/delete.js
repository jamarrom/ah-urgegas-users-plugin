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
    username: "TestUserDelete1",
    email: "testDelete1@kwantec.com",
    firstName: 'TestDelete1',
    lastName: 'Test1',
    password: "A12345678",
    roleCode: 'CLIENT_Super',
};
const newUser2 = {
    username: "TestUserDelete2",
    email: "testDelete2@kwantec.com",
    firstName: 'TestDelete1',
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

describe("Delete new user.", () => {
    beforeAll(async () => {
        api = await actionhero.start();
    });

    afterAll(async () => {
        const User = api.mongooseModels.KwanUsers_User;
        // Deletes all types created during testing
        await User.deleteMany({ firstName: "TestDelete1" });
        await actionhero.stop();
    });


    test('It Deletes a user.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser1
        // Run the action
        let user = await api.specHelper.runAction(
            "user:create",
            connection
        );
        const { _id } = user.newUser;
        connection.params = { _id: _id }

        let response = await api.specHelper.runAction(
            "delete:user",
            connection
        );
        // Expected results
        expect(response.msg).toBe('delete complete');
        expect(response.body.n).toBe(1);
        expect(response.body.deletedCount).toBe(1);
    });

    test('It Fails whith incorrect id.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = { _id: '5e2b28210A49d796c97A7945' }

        let response = await api.specHelper.runAction(
            "delete:user",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
    });

    test('It fails with invalid scope.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser1
        // Run the action
        let user = await api.specHelper.runAction(
            "user:create",
            connection
        );
        const { _id } = user.newUser;
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'OWNER/Demo' } };
        connection.params = { _id: _id }

        let response = await api.specHelper.runAction(
            "delete:user",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
        expect(response.error).toBe('Error: You don\'t have access to this owner scope.');
    });

    test('It fails with invalid token.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser2
        // Run the action
        let user = await api.specHelper.runAction(
            "user:create",
            connection
        );
        const { _id } = user.newUser;
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: 'invalidToken', ownerscope: 'ADMIN/Main' } };
        connection.params = { _id: _id }

        let response = await api.specHelper.runAction(
            "delete:user",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
        expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
    });
});