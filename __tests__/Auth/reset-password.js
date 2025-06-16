"use strict";

const ActionHero = require("actionhero");
const actionhero = new ActionHero.Process();
const bcrypt = require("bcryptjs");
require("dotenv").config();
let api;

describe("BACK-000: Reset password.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
    const User = api.mongooseModels.KwanUsers_User;
    const password = await bcrypt.hash('A12345678', 12);
    const mockUser = new User({
      username: "reset",
      verified: true,
      email: "reset@kwantec.com",
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
    await User.deleteOne({email: "reset@kwantec.com"})
    await actionhero.stop();
  });

  test("Pass with a token on it response and a message", async () => {
    const mockParams = {
      email: "reset@kwantec.com",
      test:true
    };

    await api.specHelper.runAction(
      "auth:password:recover",
      mockParams
    );

    // Reset the password to it original state.
    let { body } = await api.KwanPlugin.read({
      model: "KwanUsers_User",
      column: "email",
      value: "reset@kwantec.com"
    });

    let mockReset = {
      _id: body._id,
      password: "A12345678",
      confirmPassword: "A12345678",
      test:true
    };

    let response = await api.specHelper.runAction("auth:password:reset", mockReset);

    expect(response.body.token).toBeDefined();
    expect(response.msg).toEqual("Login succesfully.");
    
  });

  test("Fails if no has parameters.", async () => {
    const mockParams = {
      email: "dummy",
      test:true
    };

    let response = await api.specHelper.runAction(
      "auth:password:reset",
      mockParams
    );

    expect(response.error).toEqual("Error: Missing required parameters");
  });

  test("Fails if he password isn't strong.", async () => {
    const mockParams = {
      email: "reset@kwantec.com",
      password: "dummy",
      confirmPassword: "dummy",
      test:true
    };

    let response = await api.specHelper.runAction(
      "auth:password:reset",
      mockParams
    );
    expect(response.error).toEqual('Error: Missing required parameters');
  });
});
