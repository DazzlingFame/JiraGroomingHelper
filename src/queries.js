export const getTasksInStudyQuery = (nextSprintName) =>
  `Sprint = "${nextSprintName}" and "Story Points[Number]" is EMPTY and (status = Study or status = Analysis) and assignee is not EMPTY`;

export const getTasksToStudyQuery = (nextSprintName) =>
  `Sprint = "${nextSprintName}" and "Story Points[Number]" is EMPTY and (status = Study or status = Analysis) and assignee is EMPTY`;

export const getTasksToEstimateQuery = (nextSprintName) =>
  `Sprint = "${nextSprintName}" and "Story Points[Number]" is EMPTY and status = "Awaiting estimate"`;
