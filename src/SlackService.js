import { IncomingWebhook } from "@slack/webhook";
import { SLACK_HOOK_URL } from "../credentials.js";

const webhook = new IncomingWebhook(SLACK_HOOK_URL);
const sendSlackMessage = async (message) => {
  if (!SLACK_HOOK_URL) {
    console.error("PROVIDE SLACK_HOOK_URL");
  } else {
    await webhook.send({
      text: message,
    });
  }
};

export default {
  sendSlackMessage,
};
