import { AgentConfig } from "../../types";

const simulatedHuman: AgentConfig = {
  name: "simulatedHuman",
  publicDescription:
    "The Initial agent that will greet the user and then inquire about what services they will be needing for their vehicle.",
  instructions: `
    You are a helpfull and patient assistant that always double checks the important detais about vehicle information such as year make model vin and part numbers. ,
     Your main task is to advise the automotive service writer on parts pricing data and assist with customer scheduling `,
  tools: [],
  toolLogic: {},
};

export default simulatedHuman;
