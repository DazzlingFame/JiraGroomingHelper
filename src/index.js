import { CREDENTIALS } from "../credentials.js";
import SenderService from "./SenderService.js";
import JiraService from "./JiraService.js";
import { getRandomResponsibleForTask } from "./randomUtils.js";

const RESPONSIBLE_MAP = {
  Web: ["<@kolesnikovvv>", "<@slipenchukdv>"],
  RBO: ["<@kolesnikovvv>", "<@slipenchukdv>"],
  Front: ["<@kolesnikovvv>", "<@slipenchukdv>"],
  Back: ["<@pankratevks>", "<@erikovpa>"],
  Analytics: ["<@proalex>"],
  Product: ["<@karepovals>"],
};

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
    await SenderService.sendMessage(message);
  }
};

const notifyAboutNotStudy = async (localMode = false) => {
  const tasks = await JiraService.getTasksToStudy();
  const messages = tasks.issues.map((task) => {
    const mainTaskComponent = task.fields.components[0]
      ? task.fields.components[0].name
      : "Product";

    const responsibles = RESPONSIBLE_MAP[mainTaskComponent]
      ? getRandomResponsibleForTask(
          task.fields.summary,
          RESPONSIBLE_MAP[mainTaskComponent]
        )
      : "- нет компонентов - <@karepovals>";
    return `<https://profiru.atlassian.net/browse/${task.key}|${task.fields.summary}> - ${responsibles}`;
  });

  const message =
    `\n\n*Нужно взять на проработку для следующего спринта*\n` +
    messages.join("\n");
  console.log(message);
  if (!localMode) {
    await SenderService.sendMessage(message);
  }
};

const notifyAboutGrooming = async (localMode = false) => {
  const tasks = await JiraService.getTasksToEstimate();
  const messages = tasks.issues.map((task) => {
    return `<https://profiru.atlassian.net/browse/${task.key}|${task.fields.summary}>`;
  });

  const message = messages.length
    ? "\n\n*У нас проработаны следующие задачи для оценки:*\n" +
      messages.join("\n")
    : "\n\n*Нет проработанных задач для оценки*";
  console.log(message);
  if (!localMode) {
    await SenderService.sendMessage(message);
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
