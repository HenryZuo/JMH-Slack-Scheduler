
exports.newWebhook = function newWebhook (req, res) {
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(JSON.stringify({ "speech": response, "displayText": response
    //"speech" is the spoken version of the response, "displayText" is the visual version
    }));
};

// {
//   "id": "85a3a530-9b77-423d-888e-2b54c000088d",
//   "timestamp": "2017-07-17T23:32:10.399Z",
//   "lang": "en",
//   "result": {
//     "source": "agent",
//     "resolvedQuery": "remind me to dance tomorrow",
//     "action": "",
//     "actionIncomplete": false,
//     "parameters": {
//       "date": "2017-07-18",
//       "task": "dance"
//     },
//     "contexts": [],
//     "metadata": {
//       "intentId": "70096c25-65dd-4a85-a2f4-186bac4d4d42",
//       "webhookUsed": "true",
//       "webhookForSlotFillingUsed": "false",
//       "webhookResponseTime": 141,
//       "intentName": "add_task"
//     },
//     "fulfillment": {
//       "speech": "Webhook Default Response",
//       "displayText": "Webhook Default Response",
//       "messages": [
//         {
//           "type": 0,
//           "speech": "Webhook Default Response"
//         }
//       ]
//     },
//     "score": 1
//   },
//   "status": {
//     "code": 200,
//     "errorType": "success"
//   },
//   "sessionId": "ee2dd9d8-b8e7-40a1-b49f-fa6dfbcb46da"
// }
