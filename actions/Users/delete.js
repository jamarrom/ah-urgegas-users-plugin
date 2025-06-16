"use strict";
const { Action, api } = require("actionhero");

module.exports = class DeleteUser extends Action {
  constructor() {
    super();
    this.name = "delete:user";
    this.description = "deletes a user";
    this.permission = "DELETE_USER";
    this.middleware = ["hasOwnerScope"];
    this.inputs = {
      _id: { required: true }
    };
  }

  async run(data) {
    const p = data.connection.params;
    const {_id} = data.session;
    const { body } = await api.KwanPlugin.read({
      model: "KwanUsers_User",
      value: p._id,
      column: "_id"
    });
    if(_id === p._id){
      throw new Error("You can't delete yourself");
    }
    if (body.scope[0].roleCode === "ADMIN_Super") {
      throw new Error("You can't delete the super admin.");
    }

    const doc = await api.KwanPlugin.delete({
      model: "KwanUsers_User",
      value: p._id,
      column: "_id"
    });

    data.response = doc;
  }
};
