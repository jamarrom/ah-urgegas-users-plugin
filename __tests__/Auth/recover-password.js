"use strict";

const ActionHero = require("actionhero");
const actionhero = new ActionHero.Process();
const bcrypt = require("bcryptjs");
require("dotenv").config();
let api;

describe("BACK-003: Recovery password.", () => {
  beforeAll(async () => {
    api = await actionhero.start();
    const User = api.mongooseModels.KwanUsers_User;
    const password = await bcrypt.hash('A12345678', 12);
    const mockUser = new User({
      username: "admin",
      verified: true,
      email: "recover@kwantec.com",
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
    await User.deleteOne({email: "recover@kwantec.com"})
    await actionhero.stop();
  });

  test("Pass with a message on the response and not error flag on its body", async () => {
    const mockParams = {
      email: "recover@kwantec.com",
      test: true
    };

    let response = await api.specHelper.runAction(
      "auth:password:recover",
      mockParams
    );

    // Reset the password to it original state.
    let { body } = await api.KwanPlugin.read({
      model: "KwanUsers_User",
      column: "email",
      value: "recover@kwantec.com"
    });

    let mockReset = {
      _id: body._id,
      password: "A12345678",
      confirmPassword: "A12345678",
      test:true
    };

    let resetResponse = await api.specHelper.runAction("auth:password:reset", mockReset);

    expect(response.msg).toEqual("Password recovery requested");
    expect(response.body).toEqual(null);
    expect(resetResponse.body.token).toBeDefined();
    expect(resetResponse.msg).toEqual("Login succesfully.");

  });

  test("It send an error flag on body when there's no user registered with the given email.", async () => {
    const mockParams = {
      email: "invalid@admin.com",
      test:true
    };

    let response = await api.specHelper.runAction(
      "auth:password:recover",
      mockParams
    );

    expect(response.body.error).toEqual(true);
  });
});
