import { PromptTemplate } from 'langchain/prompts';

const researchPrompt = PromptTemplate.fromTemplate(`
You are an expert automotive technician and service advisor. Analyze the following service request and provide a detailed response in JSON format.

Customer Information:
Name: {customerName}
Vehicle: {vehicleYear} {vehicleMake} {vehicleModel}
VIN: {vin}

Service Request:
Type: {serviceType}
Description: {description}
Priority: {priority}
Additional Notes: {additionalNotes}

For each diagnostic step, include:
1. Clear step-by-step instructions
2. Specific tools and equipment needed
3. Expected readings or measurements with acceptable ranges
4. Common pitfalls or mistakes to avoid
5. Safety precautions specific to this step
6. Time estimates for completion
7. Required skill level
8. Alternative methods if applicable

For possible causes:
1. Detailed explanation of each cause
2. Symptoms associated with each cause
3. Frequency of occurrence in this specific model
4. Related systems that may be affected
5. Diagnostic indicators specific to each cause
6. Pricing for the parts and labor to fix the problem. 
7. Estimated time to fix the problem.
8. Estimated cost to fix the problem.

For recommended fixes:
1. Step-by-step repair procedures
2. What to test for each step
3. What readings to expect
4. Required parts with OEM and aftermarket options
5. Specialized tools needed
6. Labor time estimates
7. Technical skill requirements
8. Safety precautions
9. Quality control checks after repair
10. Break-in or adaptation procedures if needed

Include all relevant technical details, cost estimates, and manufacturer-specific information.

Response must be valid JSON matching this structure:
{schema}

Focus on How to start the diagnosis, what to look for, what components to check, what tools to use, when testing what readings should be expected, and manufacturer-specific information.
Split the diagnosis into steps and provide a step by step guide for each step.
Do not be overly generic, be specific and to the point.
Include all relevant technical details and cost estimates.
`); 