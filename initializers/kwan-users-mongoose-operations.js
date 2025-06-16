"use strict";
const { Initializer, api } = require("actionhero");
const bcrypt = require("bcryptjs");

module.exports = class pluginTransactions extends Initializer {
  constructor() {
    super();
    this.name = "kwan-users-mongoose-operations";
    this.loadPriority = 2000;
  }

  async initialize() {
    api.getModel = model => {
      let result = undefined;
      for (let [key, value] of Object.entries(api.mongooseModels)) {
        if (model === key) {
          result = value;
          break;
        }
      }
      if (result) {
        return result;
      } else {
        throw new Error("No such model exists");
      }
    };
    api.get = {
      role: {
        access: async p => {
          const model = api.getModel("KwanUsers_Role");
          return await model.findOne(
            { roleCode: p.roleCode, ownerScope: p.ownerScope },
            "access roleName -_id",
            {
              lean: true
            }
          );
        },
        permissions: async p => {
          const model = api.getModel("KwanUsers_Role");
          return await model.findOne(
            { roleCode: p.roleCode, ownerScope: p.ownerScope },
            "permissions roleName -_id",
            {
              lean: true
            }
          );
        }
      },
      user: {
        scopes: async _id => {
          const model = api.getModel("KwanUsers_User");
          return await model.findById(_id, "scope -_id", {
            lean: true
          });
        }
      }
    };

    api.check = {
      user: {
        has: {
          permissions: (permissions, permission) => {
            return permissions.includes(permission) ? true : false;
          }
        }
      }
    };

    api.KwanPlugin = {
      countUsers: async p => {
        const model = api.getModel(p.model);
        return (result = await model.count({
          scope: { $elemMatch: { scopeName: p.scopeName } },
          username: p.username
        }));
      },
      create: async p => {
        const model = api.getModel(p.model);
        let doc = {};
        if (p.values["password"]) {
          p.values["password"] = await bcrypt.hash(p.values["password"], 12);
        }
        const newDoc = new model(p.values);
        try {
          const result = await newDoc.save();
          doc = {
            msg: "success",
            body: result
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      },
      read: async p => {
        const model = api.getModel(p.model);
        let doc = {};
        try {
          const result = await model.findOne({ [p.column]: p.value });
          doc = {
            msg: "success",
            body: result
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      },
      readAll: async p => {
        const model = api.getModel(p.model);
        let doc = {};
        try {
          const result = p.column
            ? await model.paginate({ [p.column]: p.value }, p.options)
            : await model.paginate({}, p.options);
          doc = {
            msg: "success",
            body: result
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      },
      update: async p => {
        const model = api.getModel(p.model);
        if (p.values["password"]) {
          p.values["password"] = await bcrypt.hash(p.values["password"], 12);
        }
        let doc = {};
        try {
          const result = await model.updateOne({ _id: p.values._id }, p.values);
          doc = {
            msg: "success",
            body: result
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      },
      delete: async p => {
        const model = api.getModel(p.model);
        let doc = {};
        try {
          const result = await model.deleteOne({ [p.column]: p.value });
          doc = {
            msg: "delete complete",
            body: result
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      },
      search: async p => {
        const model = api.getModel(p.model);
        let doc = {};
        try {
          await model.collection.dropIndexes();
          await model.collection.createIndex(p.indices);
          const result = await model.paginate(
            {
              scope: { $elemMatch: { scopeName: p.scopeName } },
              $text: { $search: p.query }
            },
            p.options
          );
          doc = {
            msg: "search complete",
            body: result
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      },
      getAdminUsers: async scopeName => {
        const model = api.getModel("KwanUsers_User");
        let doc;
        try {
          const result = await model
            .find(
              {
                scope: { $elemMatch: { scopeName: scopeName } }
              },
              {
                password: 0
              }
            )
            .lean({ virtuals: true });
          doc = result;
        } catch (err) {
          throw err;
        }
        return doc;
      },
      getRoleAccess: async userId => {
        let model = api.getModel("KwanUsers_User");
        let doc = {};
        const column = "_id";
        try {
          let user = await model.findOne({ [column]: userId }, "scope");
          model = api.getModel("KwanUsers_Role");
          let userScope = user.scope[0].scopeName;
          let userRoleCode = user.scope[0].roleCode;
          let roleAccess = await model.findOne(
            {
              roleCode: userRoleCode,
              ownerScope: userScope
            },
            "access"
          );
          doc = {
            msg: "success",
            body: roleAccess
          };
        } catch (err) {
          throw new Error(err);
        }
        return doc;
      }
    };
  }
};
