'use strict'
const { CLI, api } = require('actionhero')

module.exports = class MyCLICommand extends CLI {
  constructor() {
    super()
    this.name = 'dropDb'
    this.description = 'Drop database'
    this.example = 'actionhero command --db=[DB name]'
    this.inputs = {
      db: {required: true}
    }
  }

  async run({params}) {
    api.log("DELETING DATABASE");

    console.log( 'dropDb params:\n' + JSON.stringify(params, null,2));

    const pos = params.db.lastIndexOf('/');
    const url = params.db.substring(0, pos);
    const dbname = params.db.substring(pos+1, params.db.length);

    const client = await require("mongodb").MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      console.log("Error connecting to database " + url);
      console.log(JSON.stringify(err, null, 2));
    });

    if (!client) {
      console.log("ERROR DELETING DATABASE");
      throw new Error("Error connecting to database at " + url);
    }

    console.log("Connection successful to database " + url);

    const db = client.db(dbname);

    db.dropDatabase((err, result) => {
      if (err) { 
        console.log("Error deleting database ");
        console.log(JSON.stringify(err, null, 2));
        client.close();
        throw new Error("Error deleting database mydb");
      }
    });

    client.close();
  }
}
