"use strict";
const { Action, api } = require("actionhero");
const { stringify } = require("querystring");
const bcrypt = require("bcryptjs");
const { transporter, password } = require("../../index");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SG_KEY);

/**
 * Web service to recover user password.
 * @version 1.0.0.
 * @class RecoverPassword
 * @extends Action
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 */
module.exports = class RecoverPassword extends Action {
  constructor() {
    super();
    this.name = "auth:password:recover";
    this.description = "User forgot it password.";
    this.inputs = {
      email: { required: true },
      recaptcha: { required: false}
    };
  }

  outputExample() {
    return {
      status: true
    };
  }

  // Promise function that makes a http(s) request a return the desire result
  recapchaRequest(url) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? require('https') : require('http');
      const request = lib.get(url, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
           reject(new Error('Failed to load page, status code: ' + response.statusCode));
         }
        const body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(JSON.parse(body.join(''))));
      });
      request.on('error', (err) => reject(err))
      })
  };

  async run(data) {
    const { email, test, recaptcha } = data.connection.params;
    //Validation for incoming recaptcha request cases
    if(recaptcha){
      api.log("Recaptcha validation begins", "notice");
      const secretKey = "6LcQctcZAAAAADZkxHOARwfcuT7AIiV5DxkHvlXM";
      const query = stringify({
        secret: secretKey,
        response: recaptcha,
      });
      const rcURL = `https://www.google.com/recaptcha/api/siteverify?${query}`;
      const { success } = await this.recapchaRequest(rcURL);
      if(!success){
        api.log("Recaptcha failure", "notice");
        data.response = {
          msg: "Failed to verify recaptcha, try again",
          body: { error: true } 
        };
        return;
      }
    }

    const user = await api.KwanPlugin.read({
      model: "KwanUsers_User",
      column: "email",
      value: email
    });

    if (!user.body) {
      api.log("No user found.", "notice");
      data.response = {
        msg: "Password recovery requested.",
        body: { error: true }
      };
      return;
    }

    api.log("User found", "info");

    const customPassword = password.customPassword();
    const temporalPassword = await bcrypt.hash(customPassword, 12);

    await api.KwanPlugin.update({
      model: "KwanUsers_User",
      values: {
        _id: user.body._id,
        temporalPassword: temporalPassword
      }
    });
    if(!test){
      try {
        const msg = {
          to: email,
          from: "UrgeGas Team <hello@urgegas.com>",
          subject: "Password recovery",
          template_id: "d-33e34d9b761144aa815b3ca38ed33051",
          dynamic_template_data: {
            "user": user.body.firstName,
            "password": customPassword,
            "inviteLink": `https://${api.DOMAIN}/#/`
          },
        };
        sgMail.send(msg);
        data.response = { msg: "Password recovery requested", body: null };
      } catch (error) {
        throw error;
      }
    } else {
      data.response = { msg: "Password recovery requested", body: null };
    }
  }
};
