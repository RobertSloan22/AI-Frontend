import { AllAgentConfigsType } from "../types";
import frontDeskAuthentication from "./frontDeskAuthentication";
import customerServiceRetail from "./customerServiceRetail";
import simpleExample from "./simpleExample";
import AutomotivePlus from "./AutomotivePlus";
import AutomotiveAgent from "./AutomotiveAgent";

export const allAgentSets: AllAgentConfigsType = {
  frontDeskAuthentication,
  customerServiceRetail,
  simpleExample,
  AutomotivePlus,
  AutomotiveAgent,

};

export const defaultAgentSetKey = "simpleExample";
