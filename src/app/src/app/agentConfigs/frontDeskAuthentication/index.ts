import authenticationAgent from './authentication';
import schedulingAgent from "./schedulingAgent";
import { injectTransferTools } from '../utils';

authenticationAgent.downstreamAgents = [schedulingAgent]

const agents = injectTransferTools([authenticationAgent, schedulingAgent]);

export default agents;