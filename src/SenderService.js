import Mattermost from 'node-mattermost'
import { HOOK_URL } from "../credentials.js";

const mattermost = new Mattermost(HOOK_URL);
const sendMessage = async (message) => {
  if (!HOOK_URL) {
    console.error("PROVIDE HOOK_URL");
  } else {
    await mattermost.send({
      text: message,
    });
  }
};

export default {
  sendMessage,
};
