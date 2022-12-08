import JiraApi from "jira-client";
import { CREDENTIALS } from "../credentials.js";

const jira = new JiraApi({
  ...CREDENTIALS,
  protocol: "https",
  host: "profiru.atlassian.net",
  apiVersion: "2",
  strictSSL: true,
});

export const getTasksInStudyQuery = (nextSprintName) =>
  `Sprint = "${nextSprintName}" and "Story Points[Number]" is EMPTY and (status = Study or status = Analysis) and assignee is not EMPTY`;

export const getTasksToStudyQuery = (nextSprintName) =>
  `Sprint = "${nextSprintName}" and "Story Points[Number]" is EMPTY and (status = Study or status = Analysis) and assignee is EMPTY`;

export const getTasksToEstimateQuery = (nextSprintName) =>
  `Sprint = "${nextSprintName}" and "Story Points[Number]" is EMPTY and status = "Awaiting estimate"`;

const getSprints = async () => (await jira.getAllSprints(40)).values;
const searchTickets = async (query) => await jira.searchJira(query);

const getTasksInStudy = async () => {
  const sprints = await getSprints();
  const next_sprint = sprints.find(
    (sprint) => sprint.state === "future" && !sprint.completeDate
  );

  return await searchTickets(getTasksInStudyQuery(next_sprint.name));
};

const getTasksToStudy = async () => {
  const sprints = await getSprints();
  const next_sprint = sprints.find(
    (sprint) => sprint.state === "future" && !sprint.completeDate
  );

  return await searchTickets(getTasksToStudyQuery(next_sprint.name));
};

const getTasksToEstimate = async () => {
  const sprints = await getSprints();
  const next_sprint = sprints.find(
    (sprint) => sprint.state === "future" && !sprint.completeDate
  );
  return  await searchTickets(getTasksToEstimateQuery(next_sprint.name));
};

export default {
  getTasksInStudy,
  getTasksToStudy,
  getTasksToEstimate,
};
