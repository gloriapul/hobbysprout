/**
 * Milestones Concept - AI Augmented Version
 */

import { GeminiLLM } from './gemini-llm';

/**
 * Represents a single step in the milestone
 * @property description - The description of the step (max 200 characters)
 * @property startDate - When the step was created
 * @property completionDate - When the step was completed (if completed)
 * @property isComplete - Whether the step is completed
 */
export interface MilestoneStep {
    description: string;
    startDate: Date;
    completionDate?: Date;
    isComplete: boolean;
}

/**
 * Represents the milestone, which represents a goal and its steps
 * @property goal - The main goal (max 200 characters)
 * @property steps - Array of steps to achieve the goal
 * @property isActive - Whether the milestone is still active
 */
export interface Milestone {
    goal: string;
    steps: MilestoneStep[];
    isActive: boolean; // would become important in later version since looking at users working on one hobby at a time
}

export class Milestones {
    private goal: string = '';
    private steps: MilestoneStep[] = [];
    private isActive: boolean = true;

    /**
     * Validates goal or step input
     * @param item The item to validate
     * @throws Error if item is invalid
     */
    private validateItem(item: string): void {
        if (!item || item.trim().length === 0) {
            throw new Error('Cannot be empty');
        }
        if (item.trim().length > 200) {
            throw new Error('Description is too long (max 200 characters)');
        }

        if (this.steps.some(step => step.description === item) || this.goal === item) {
            throw new Error('Already exists');
        }
    }

    /**
     * Sets the goal for this milestone
     * @param goal The goal to set (max 200 characters)
     * @throws Error if goal is empty
     * @throws Error if goal is too long (more than 200 characters)
     * @throws Error if goal already exists
     * @returns The set goal
     */
    setGoal(goal: string): string {
        this.validateItem(goal);

        this.goal = goal;
        return goal;
    }

    /**
     * Generates steps for the goal using the Gemini LLM
     * @param llm The Gemini LLM instance to use for the step generating
     * @throws Error if goal is not set
     * @throws Error if LLM response is invalid
     * @throws Error if no valid steps were generated
     * @returns Array of generated milestone steps
     */
    async generateSteps(llm: GeminiLLM): Promise<MilestoneStep[]> {
        if (!this.goal) {
            throw new Error('Goal must exist');
        }

        const prompt = `
        You are a helpful AI assistant that creates a recommended plan of clear steps for people looking to work on a hobby.

        Create a structured step-by-step plan for this goal: "${this.goal}"

        Response Requirements:
        1. Return ONLY a single-line JSON array of strings
        2. Each string should be a specific, complete, measurable, and actionable step
        3. Step must be relevant to the goal and feasible for an average person, should not be overly ambitious or vague
        4. Only contain necessary steps to achieve the goal, avoid filler steps
        5. Based on the goal, be mindful of number of steps generated and do not make a step for every single small action
        6. Steps must be in logical order
        7. Do NOT use line breaks or extra whitespace
        8. Properly escape any quotes in the text
        9. No step numbers or prefixes
        10. No comments or explanations

        Example response format:
        ["Research camera settings and features","Practice taking photos in different lighting","Review and organize test shots"]

        Return ONLY the JSON array, nothing else.`;

        let response = await llm.executeLLM(prompt);

        // parsing llm response
        response = response.trim();
        try {
            // cleaning up the response as a caution
            response = response.replace(/\n/g, ' ') // newlines
                             .replace(/\s+/g, ' ') // whitespace
                             .replace(/,\s*]/g, ']') // trailing commas
                             .replace(/,\s*,/g, ',') // double commas
                             .trim();
            
            let steps: string[];
            try {
                steps = JSON.parse(response) as string[];
            } catch (parseError) {
                throw new Error('Could not parse steps from response');
            }

            if (!Array.isArray(steps) || steps.length === 0) {
                throw new Error('Response did not contain valid steps');
            }
        
            this.steps = steps.map(description => ({
                description,
                isComplete: false,
                startDate: new Date()
            }));

            return this.steps;
        } catch (error) {
            console.error('❌ Error generating steps:', error);
            throw error;
        }
    }

    /**
     * Adds a step inputted by user
     * @param description The step description (max 200 characters)
     * @throws Error if goal is not set
     * @throws Error if description is empty
     * @throws Error if description is too long (>200 chars)
     * @returns Updated array of all milestone steps
     */
    setSteps(description: string): MilestoneStep[] {
        if (!this.goal) {
            throw new Error('Goal must exist');
        }
        this.validateItem(description);

        const step: MilestoneStep = {
            description,
            isComplete: false,
            startDate: new Date()
        };

        this.steps.push(step);
        return this.steps;
    }

    /**
     * Marks a step as complete
     * @param description The step to complete
     * @throws Error if step not found or not in progress
     */
    completeStep(description: string): MilestoneStep[] {
        const step = this.steps.find(s => s.description === description);
        if (!step) {
            throw new Error('Step not found');
        }
        if (step.isComplete) {
            throw new Error('Step is already complete');
        }

        step.isComplete = true;
        step.completionDate = new Date();

        if (this.steps.every(s => s.isComplete)) {
            this.closeMilestones(); // goal is complete
        }

        return this.steps;
    }

    /**
     * Closes the milestone, this indicates that the user has completed their goal or has decided to abandon their goal
     * @throws Error if milestone is not active
     */
    closeMilestones(): void {
        if (!this.isActive) {
            throw new Error('Milestone is already not active');
        }
        this.isActive = false;
    }

    /**
     * Gets all steps
     */
    getSteps(): MilestoneStep[] {
        return this.steps;
    }

    /**
     * Gets the current goal
     */
    getGoal(): string {
        return this.goal;
    }

    /**
     * Checks if the milestone is active
     */
    getIsActive(): boolean {
        return this.isActive;
    }
}