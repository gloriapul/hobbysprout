/**
 * Milestones Test Cases
 * 
 * Demonstrates both manual step creation and LLM-assisted step generation
 */

import { Milestones } from './milestones';
import { GeminiLLM, Config } from './gemini-llm';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

/**
 * Test case 1: Input validation
 * Tests validation of goal and step inputs
 */
export async function testValidation(): Promise<void> {
    console.log('\n🧪 TEST CASE 1: Input Validation');
    console.log('===================================');
    
    const milestone = new Milestones();
    
    try {
        console.log('Testing empty goal...');
        milestone.setGoal('');
        console.error('❌ Should have thrown error for empty goal');
    } catch (error) {
        console.log('✅ Successfully caught empty goal:', (error as Error).message);
    }

    try {
        console.log('\nTesting very long goal...');
        milestone.setGoal('a'.repeat(201));
        console.error('❌ Should have thrown error for too long goal');
    } catch (error) {
        console.log('✅ Successfully caught too long goal:', (error as Error).message);
    }

    console.log('\nSetting valid goal for step tests...');
    milestone.setGoal('Test Goal');

    try {
        console.log('Testing empty step...');
        milestone.setSteps('');
        console.error('❌ Should have thrown error for empty step');
    } catch (error) {
        console.log('✅ Successfully caught empty step:', (error as Error).message);
    }

    try {
        console.log('\nTesting very long step...');
        milestone.setSteps('a'.repeat(201));
        console.error('❌ Should have thrown error for too long step');
    } catch (error) {
        console.log('✅ Successfully caught too long step:', (error as Error).message);
    }

    try {
        console.log('\nTesting step without goal...');
        const noGoalMilestone = new Milestones();
        noGoalMilestone.setSteps('Valid step');
        console.error('❌ Should have thrown error for step without goal');
    } catch (error) {
        console.log('✅ Successfully caught step without goal:', (error as Error).message);
    }

    try {
        console.log('\nTesting completing non-existent step...');
        milestone.completeStep('Non-existent step');
        console.error('❌ Should have thrown error for non-existent step');
    } catch (error) {
        console.log('✅ Successfully caught non-existent step:', (error as Error).message);
    }
}

/**
 * Test case 2: Manual step creation
 * Demonstrates setting a goal and manually adding steps
 */
export async function testManualSteps(): Promise<void> {
    console.log('\n🧪 TEST CASE 2: Manual Step Creation');
    console.log('===================================');
    
    const milestone = new Milestones();
    
    // set the goal
    console.log('📝 Setting goal...');
    const goal = milestone.setGoal('Learn to knit a sweater for the winter season');
    console.log(`Goal set: ${goal}`);
    
    // add manual steps
    console.log('\n📝 Adding steps manually...');
    milestone.setSteps('Research different sweater patterns');
    milestone.setSteps('Purchase yarn and knitting needles');
    milestone.setSteps('Learn basic knitting stitches');
    milestone.setSteps('Practice with a small swatch');
    milestone.setSteps('Start with the sweater back panel');
    milestone.setSteps('Finish sweater front panel');
    milestone.setSteps('Finish sleeves');
    milestone.setSteps('Assemble sweater');

    // display steps
    console.log('\n📋 Current steps:');
    milestone.getSteps().forEach(step => {
        console.log(`- ${step.description} (started: ${step.startDate.toLocaleDateString()}, ${step.isComplete ? 'complete' : 'to be completed'})`);
    });
    
    // complete some steps
    console.log('\n✅ Completing first two steps...');
    milestone.completeStep('Research different sweater patterns');
    milestone.completeStep('Purchase yarn and knitting needles');
    
    // display updated steps
    console.log('\n📋 Updated steps:');
    milestone.getSteps().forEach(step => {
        const status = step.completionDate ? `completed: ${step.completionDate.toLocaleDateString()})` : `${step.isComplete ? 'complete' : 'to be completed'})`;
        console.log(`- ${step.description} (started: ${step.startDate.toLocaleDateString()}, ${status}`);
    });
}

/**
 * Test case 3: LLM-assisted step generation
 * Demonstrates using the Gemini LLM to generate steps for goal with a deadline
 */
export async function testLLMSteps1(): Promise<void> {
    console.log('\n🧪 TEST CASE 3: LLM-Assisted Steps Generation for a Goal with a Deadline');
    console.log('=========================================');
    
    const milestone = new Milestones();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    // set the goal
    console.log('📝 Setting goal...');
    const goal = milestone.setGoal('Learn photography basics, I have an event to photograph in 2 days. I do not own a camera and am colorblind');
    console.log(`Goal set: ${goal}`);

    // generate steps using LLM
    console.log('\n🤖 Generating steps using LLM...');
    const steps = await milestone.generateSteps(llm);
    
    // display generated steps
    console.log('\n📋 Generated steps:');
    steps.forEach(step => {
        console.log(`- ${step.description} (${step.isComplete ? 'complete' : 'to be completed'})`);
    });
    
    // complete a couple of steps
    console.log('\n✅ Completing first step...');
    milestone.completeStep(steps[0].description);

    // display updated status
    console.log('\n📋 Updated steps:');
    milestone.getSteps().forEach(step => {
        const status = step.completionDate ? `completed: ${step.completionDate.toLocaleDateString()})` : `${step.isComplete ? 'complete' : 'to be completed'})`;
        console.log(`- ${step.description} (started: ${step.startDate.toLocaleDateString()}, ${status}`);
    });
}

/**
 * Test case 4: LLM-assisted step generation
 * Demonstrates using the Gemini LLM to generate steps for an unclear goal
 */
export async function testLLMSteps2(): Promise<void> {
    console.log('\n🧪 TEST CASE 4: LLM-Assisted Steps Generation for an Unclear Goal');
    console.log('=========================================');
    
    const milestone = new Milestones();
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    
    // set the goal
    console.log('📝 Setting goal...');
    const goal = milestone.setGoal('Learn how to cook');
    console.log(`Goal set: ${goal}`);

    // generate steps using LLM
    console.log('\n🤖 Generating steps using LLM...');
    const steps = await milestone.generateSteps(llm);
    
    // display generated steps
    console.log('\n📋 Generated steps:');
    steps.forEach(step => {
        console.log(`- ${step.description} (${step.isComplete ? 'complete' : 'to be completed'})`);
    });
    
    // complete a couple of steps
    console.log('\n✅ Completing first step...');
    milestone.completeStep(steps[0].description);

    // display updated status
    console.log('\n📋 Updated steps:');
    milestone.getSteps().forEach(step => {
        const status = step.completionDate ? `completed: ${step.completionDate.toLocaleDateString()})` : `${step.isComplete ? 'complete' : 'to be completed'})`;
        console.log(`- ${step.description} (started: ${step.startDate.toLocaleDateString()}, ${status}`);
    });
}

/**
 * Test case 5: Milestone completion
 * Demonstrates completing all steps and closing a milestone
 */
export async function testMilestoneCompletion(): Promise<void> {
    console.log('\n🧪 TEST CASE 5: Milestone Completion for a Longer Ambitious Goal');
    console.log('==================================');
    
    const milestone = new Milestones();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    // set up a milestone
    console.log('📝 Setting up milestone...');
    const goal = milestone.setGoal('Learn how to make a 1 hour podcast. I want to understand the entire process from planning, recording, editing, and publishing. I am aiming to change the world and solve crises with this podcast.');
    console.log(`Goal set: ${goal}`);

    // generate steps using LLM
    console.log('\n🤖 Generating steps using LLM...');
    const steps = await milestone.generateSteps(llm);
    
    // display steps
    console.log('\n📋 Generated steps:');
    steps.forEach(step => {
        console.log(`- ${step.description} (started: ${step.startDate.toLocaleDateString()}, ${step.isComplete ? 'complete' : 'to be completed'})`);
    });

    // mixing manual steps with the generated steps, future implementation will include ability to edit and delete generated steps
    console.log('\n📝 Adding one more step manually...');
    milestone.setSteps('Start a podcasting business');

    // display steps
    console.log('\n📋 Updated steps:');
    steps.forEach(step => {
        console.log(`- ${step.description} (started: ${step.startDate.toLocaleDateString()}, ${step.isComplete ? 'complete' : 'to be completed'})`);
    });

    // complete all steps
    console.log('\n✅ Completing all steps...');
    milestone.getSteps().forEach(step => {
        if (!step.isComplete) {
            milestone.completeStep(step.description);
        }
    });

    // verify milestone status
    console.log('\n📋 Milestone status now that all steps were completed...');
    console.log(`Active: ${milestone.getIsActive()}`);
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('Milestones Test Suite');
    console.log('========================\n');
    
    try {
        // run validation tests
        await testValidation();
        
        // run manual steps test
        await testManualSteps();
        
        // run LLM steps test
        await testLLMSteps1();
        await testLLMSteps2();

        // run full completion test
        await testMilestoneCompletion();
        
        console.log('\n🎉 All test cases completed successfully!');
        
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
