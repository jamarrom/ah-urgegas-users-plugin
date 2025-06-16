"use strict";
const { Initializer, api } = require("actionhero");
const bcrypt = require("bcryptjs");

module.exports = class pluginTransactions extends Initializer {
  constructor() {
    super();
    this.name = "dummy-transactions";
    this.loadPriority = 2000;
  }

  async initialize() {
    api.dict = {
      passwordField: "password",
      resultsLimit: 10
    };

    api.hashPass = async params => {
      return await bcrypt.hash(params, 12);
    };

    api.mongo = async params => {
      let {
        action,
        dbModel,
        values,
        sort,
        populate,
        find,
        page,
        limit
      } = params;
      let doc;
      const model = api.getModel(dbModel);
      switch (action) {
        case "CREATE":
          "password" in values
            ? (values["password"] = api.hashPass(values["password"]))
            : 1;
          const newDoc = new model(values);
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
        case "READ":
          let doc;
          try {
            const result = await model
              .find(find)
              //SORT
              .sort(sort)
              //SKIP
              .skip(limit * page)
              //LIMIT
              .limit(limit)
              .populate(populate);
            doc = {
              msg: "success",
              body: result
            };
          } catch (err) {
            throw new Error(err);
          }
          return doc;
        case "UPDATE":
          break;
        case "DELETE":
          break;

        default:
          break;
      }
    };
  }
};
