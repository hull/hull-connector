import inquirer from "inquirer";

export default function parsePrompt(config = {}) {
  const { HULL_ID, HULL_ORG, HULL_SECRET } = config;
  if (HULL_ID && HULL_SECRET && HULL_ORG) return config;
  return inquirer
    .prompt([
      {
        type: "input",
        name: "HULL_ID",
        message: "SHIP_ID"
      },
      {
        type: "input",
        name: "HULL_SECRET",
        message: "SHIP_SECRET"
      },
      {
        type: "input",
        name: "HULL_ORG",
        message: "SHIP_ORG"
      }
    ])
    .then(conf => ({ ...config, ...conf }));
}
