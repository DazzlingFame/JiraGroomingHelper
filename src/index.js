import JiraApi from "jira-client";
import { IncomingWebhook } from "@slack/webhook";
import { CREDENTIALS, SLACK_HOOK_URL } from "./../credentials.js";

const webhook = new IncomingWebhook(SLACK_HOOK_URL);

let jira = new JiraApi({
  ...CREDENTIALS,
  protocol: "https",
  host: "profiru.atlassian.net",
  apiVersion: "2",
  strictSSL: true,
});

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
  const sprints = (await jira.getAllSprints(40)).values;
  const next_sprint = sprints.find(
    (sprint) => sprint.state === "future" && !sprint.completeDate
  );

  const tasks = await jira.searchJira(
    `Sprint = "${next_sprint.name}" and "Story Points[Number]" is EMPTY and (status = Study or status = Analysis) and assignee is not EMPTY`
  );

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
    await webhook.send({
      text: message,
    });
  }
};

const notifyAboutNotStudy = async (localMode = false) => {
  const sprints = (await jira.getAllSprints(40)).values;
  const next_sprint = sprints.find(
      (sprint) => sprint.state === "future" && !sprint.completeDate
  );
  const tasks = await jira.searchJira(
      `Sprint = "${next_sprint.name}" and "Story Points[Number]" is EMPTY and (status = Study or status = Analysis) and assignee is EMPTY`
  );

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
      `\n\n*Нужно взять на проработку для сл. спринта (${next_sprint.name})*\n` +
      messages.join("\n");
  console.log(message);
  if (!localMode) {
    await webhook.send({
      text: message,
    });
  }
};

const notifyAboutGrooming = async (localMode = false) => {
  const sprints = (await jira.getAllSprints(40)).values;
  const next_sprint = sprints.find(
    (sprint) => sprint.state === "future" && !sprint.completeDate
  );
  const tasks = await jira.searchJira(
    `Sprint = "${next_sprint.name}" and "Story Points[Number]" is EMPTY and status = "Awaiting estimate"`
  );
  const messages = tasks.issues.map((t) => {
    return `https://profiru.atlassian.net/browse/${t.key} - ${t.fields.summary}`;
  });
  const message = messages.length
    ? "\n\n*У нас проработаны следующие задачи для оценки сегодня:*\n " +
      messages.join("\n")
    : "\n\n*Нет проработанных задач для оценки*";
  console.log(message);
  if (!localMode) {
    await webhook.send({
      text: message,
    });
  }
};

const notifyAboutTasks = async (localMode = false) => {
  await notifyAboutStudy(localMode);
  await notifyAboutNotStudy(localMode);
  await notifyAboutGrooming(localMode);
};

if (!CREDENTIALS || !SLACK_HOOK_URL) {
  console.error("PROVIDE CREDENTIALS TO START");
} else {
  notifyAboutTasks();
}
