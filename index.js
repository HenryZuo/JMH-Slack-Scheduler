
exports.newWebhook = function newWebhook (req, res) {
  response = "Webhook is working (this is a default response)" //Default response from the webhook to show it's working
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(JSON.stringify({ "speech": response, "displayText": response
    //"speech" is the spoken version of the response, "displayText" is the visual version
    }));
};
