/*
jshint esversion: 6
*/

(function() {
    "use strict";

    let usAccounts = require('./usAccounts.json'),
        caAccounts = require('./caAccounts.json'),
        testAccounts = require('./test.json');

    console.log('usAccounts length: ' + usAccounts.length);
    console.log('caAccounts length: ' + caAccounts.length);

    let accounts = caAccounts;

    // build data arrays
    let toArray = [],
        mergeVarsArray = [];
    for(let i=0; i< accounts.length; i+=1) {
      toArray.push({
        'email': accounts[i].email,
        'name': accounts[i].name,
        'type': 'to'
      });

       // example of dynamic merge tags (need to be matched to rcpt)
      mergeVarsArray.push({
        "rcpt": accounts[i].email,
        "vars": [{
          "name": "COUNTRYPREFIX",
          "content": "Now available to Canadian retailers."
        }]
      });
    }

    let options = {
      template_name: '',
      template_content: '',
      merge_vars: mergeVarsArray,
      tags: '',
      subject: '',
      to: toArray,
      from_email: '',
      from_name: '',
      reply_to: '',
      send_at: '', // UTC timestamp in YYYY-MM-DD HH:MM:SS format.
      apiKey: ''
    },
    callback = (result) => {
      console.log('Request sent. Got Mandrill result:');
      console.log(result);
    };

    console.log('sending mail:');
    sendMandrillEmail(options, callback);

    /*
      Wrapper function for implementing Mandrill /messages/send-template.json endpoint
      See https://mandrillapp.com/api/docs/messages.JSON.html#method=send-template
    */
    function sendMandrillEmail(options, callback) {
      const mandrill = require('mandrill-api/mandrill');
      const mandrill_client = new mandrill.Mandrill(options.apiKey);

      let template_name = options.template_name,
          template_content = options.template_content,
          message = {
              "subject": options.subject,
              "from_email": options.from_email,
              "from_name": options.from_name,
              "to": options.to,
              "headers": {
                  "Reply-To": options.reply_to
              },
              "important": false,
              "track_opens": null,
              "track_clicks": null,
              "auto_text": null,
              "auto_html": null,
              "inline_css": null,
              "url_strip_qs": null,
              "preserve_recipients": null,
              "view_content_link": null,
              "bcc_address": null,
              "tracking_domain": null,
              "signing_domain": null,
              "return_path_domain": null,
              "merge": true,
              "merge_language": "mailchimp",
              "global_merge_vars": options.global_merge_vars,
              "merge_vars": options.merge_vars,
              "tags": options.tags,
              "subaccount": null,
              "google_analytics_domains": null,
              "google_analytics_campaign": null,
              "metadata": null,
              "recipient_metadata": null,
              "attachments": null,
              "images": null
          },
          async = false,
          ip_pool = "Main Pool",
          // UTC timestamp in YYYY-MM-DD HH:MM:SS format.
          send_at = options.send_at;

      mandrill_client.messages.sendTemplate({
        "template_name": template_name,
        "template_content": template_content,
        "message": message,
        "async": async,
        "ip_pool": ip_pool,
        "send_at": send_at
      }, (result) => {
          // success callback
          callback(result);
      }, function(e) {
          // Mandrill returns the error as an object with name and message keys

          let errorMessage = 'A mandrill error occurred: ' + e.name + ' - ' + e.message;
          console.error(errorMessage); // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'

          callback(errorMessage);
      });
    }

})();
