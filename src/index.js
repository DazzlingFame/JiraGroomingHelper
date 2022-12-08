import { CREDENTIALS } from "./../credentials.js";
import SlackService from "./SlackService.js";
import JiraService from "./JiraService.js";

const RESPONSIBLE_MAP = {
  Web: ["<@kolesnikovvv>", "<@slipenchukdv>"],
  RBO: ["<@kolesnikovvv>", "<@slipenchukdv>"],
  Front: ["<@kolesnikovvv>", "<@slipenchukdv>"],
  Back: ["<@pankratevks>", "<@osipovao>"],
  Analytics: ["<@proalex>"],
  Product: ["<@karepovals>"],
};

function get_random(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const notifyAboutStudy = async (localMode = false) => {
  const tasks = await JiraService.getTasksInStudy();
  const messages = tasks.issues.map((task) => {
    const assignee = task.fields.assignee.emailAddress
      ? task.fields.assignee.emailAddress.split("@")[0]
      : "karepovals";

    return `<https://profiru.atlassian.net/browse/${task.key}|${task.fields.summary}>  - <@${assignee}>`;
  });
  const message =
    "*У нас на проработке следующие задачи, если проработка завершена, переведите в статус Awaiting Estimate:*\n" +
    messages.join("\n");
  console.log(message);
  if (!localMode) {
    await SlackService.sendSlackMessage(message);
  }
};

const notifyAboutNotStudy = async (localMode = false) => {
  const tasks = await JiraService.getTasksToStudy();
  const messages = tasks.issues.map((task) => {
    const main_component = task.fields.components[0]
      ? task.fields.components[0].name
      : "Product";

    const responsibles = RESPONSIBLE_MAP[main_component]
      ? get_random(RESPONSIBLE_MAP[main_component])
      : "- нет компонентов - <@karepovals>";
    return `<https://profiru.atlassian.net/browse/${task.key}|${task.fields.summary}> - ${responsibles}`;
  });

  const message =
    `\n\n*Нужно взять на проработку для следующего спринта*\n` +
    messages.join("\n");
  console.log(message);
  if (!localMode) {
    await SlackService.sendSlackMessage(message);
  }
};

const notifyAboutGrooming = async (localMode = false) => {
  const tasks = await JiraService.getTasksToEstimate();
  const messages = tasks.issues.map((task) => {
    return `https://profiru.atlassian.net/browse/${task.key} - ${task.fields.summary}`;
  });

  const message = messages.length
    ? "\n\n*У нас проработаны следующие задачи для оценки сегодня:*\n " +
      messages.join("\n")
    : "\n\n*Нет проработанных задач для оценки*";
  console.log(message);
  if (!localMode) {
    await SlackService.sendSlackMessage(message);
  }
};

const notifyAboutTasks = async (localMode = false) => {
  await notifyAboutStudy(localMode);
  await notifyAboutNotStudy(localMode);
  await notifyAboutGrooming(localMode);
};

if (!CREDENTIALS) {
  console.error("PROVIDE CREDENTIALS TO START");
} else {
  notifyAboutTasks();
}
