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
    username: "TestUpdateUser1",
    email: "testupdate1@kwantec.com",
    firstName: 'TestUpdate1',
    lastName: 'Test1',
    password: "A12345678",
    roleCode: 'CLIENT_Super',
};
const newUser2 = {
    username: "TestUpdateUser2",
    email: "testupdate2@kwantec.com",
    firstName: 'TestUpdate1',
    lastName: 'Test1',
    password: "A12345678",
    roleCode: 'CLIENT_Super',
};
const newUser3 = {
    username: "TestUpdateUser3",
    email: "testupdate3@kwantec.com",
    firstName: 'TestUpdate1',
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
        await User.deleteMany({ firstName: "TestUpdate1" });
        await User.deleteMany({ firstName: "TestUpdated1" });
        await actionhero.stop();
    });


    test('It updates the user.', async () => {
        // Get body property from the login action
        let { body } = await login('ADMIN', 'Daniel')
        // Create new connection to send to the action
        let connection = await createConnection();
        // Create the headers necessary for the action and assign params
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser1
        // Run the action

        const mockUser = await api.specHelper.runAction(
            "user:create",
            connection
        );
        newUser1.username = 'TestUpdated1'
        newUser1._id = mockUser.newUser._id
        connection.params = newUser1
        // Run the action
        let caseUserName = await api.specHelper.runAction(
            "users:update",
            connection
        );
        // Expected results
        expect(caseUserName.msg).toBe('success');
        expect(caseUserName.body.nModified).toBe(1);

        newUser1.firstName = 'TestUpdated1'
        newUser1._id = mockUser.newUser._id
        connection.params = newUser1
        // Run the action
        let caseFirstName = await api.specHelper.runAction(
            "users:update",
            connection
        );
        // Expected results
        expect(caseFirstName.msg).toBe('success');
        expect(caseFirstName.body.nModified).toBe(1);

        newUser1.lastName = 'TestUpdated1'
        newUser1._id = mockUser.newUser._id
        connection.params = newUser1
        // Run the action
        let caseLastName = await api.specHelper.runAction(
            "users:update",
            connection
        );
        // Expected results
        expect(caseLastName.msg).toBe('success');
        expect(caseLastName.body.nModified).toBe(1);
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
        const mockUser = await api.specHelper.runAction(
            "user:create",
            connection
        );

        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: 'InvalidToken', ownerscope: 'ADMIN/Main' } };
        newUser2.username = 'TestUpdated1'
        newUser2._id = mockUser.newUser._id
        connection.params = newUser2
        // Run the action
        let response = await api.specHelper.runAction(
            "users:update",
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
        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: body.token, ownerscope: 'ADMIN/Main' } };
        connection.params = newUser3
        // Run the action
        const mockUser = await api.specHelper.runAction(
            "user:create",
            connection
        );

        connection.rawConnection.req = { headers: { system: 'ADMIN', authorization: 'InvalidToken', ownerscope: 'ADMIN/Main' } };
        newUser3.username = 'TestUpdated1'
        newUser3._id = mockUser.newUser._id
        connection.params = newUser3
        // Run the action
        let response = await api.specHelper.runAction(
            "users:update",
            connection
        );
        // Expected results
        expect(response.error).toBeDefined();
        expect(response.error).toBe('Error: Cannot read property \'_id\' of null');
    });
});