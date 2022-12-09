import seedRandom from "seedrandom";

export const getRandomResponsibleForTask = (
  taskName = "",
  responsibles = []
) => {
  const generator = seedRandom(taskName);
  return responsibles[Math.floor(generator() * responsibles.length)];
};
