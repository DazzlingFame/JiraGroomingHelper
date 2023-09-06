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

const getNextSprint = async () => {
  // get 1 task with status 'future' from 0 index of board 40
  const sprints = (await jira.getAllSprints(40, 0, 1, "future")).values;
  return sprints[0];
};

const searchTickets = async (query) => await jira.searchJira(query);

const getTasksInStudy = async () => {
  const nextSprint = await getNextSprint();
  return await searchTickets(getTasksInStudyQuery(nextSprint.name));
};

const getTasksToStudy = async () => {
  const next_sprint = await getNextSprint();
  return await searchTickets(getTasksToStudyQuery(next_sprint.name));
};

const getTasksToEstimate = async () => {
  const next_sprint = await getNextSprint();
  return await searchTickets(getTasksToEstimateQuery(next_sprint.name));
};

export default {
  getNextSprint,
  getTasksInStudy,
  getTasksToStudy,
  getTasksToEstimate,
};
