<concept_spec>
concept Milestones
purpose
    allow users to monitor the progress that they are making toward their goals

principle
    after a user inputs their goal, they will have the option of having an llm generate their list of recommended steps
    or will be able to input their own, then being allowed to see those that they have yet to complete
    and those that have been completed

state
    a goal String
    a set of steps Strings with
        a description String
        a start Date a completion Date
        a status String an activity status Boolean

    a set of Assignment with
        an Activity
        an startTime Number

    invariants
        there is only one goal 

actions   
setGoal (goal: String): (goal: String)
    requires goal to not already exist
    effects sets goal to inputted goal

async generateSteps (llm: GeminiLLM, goal: String) : (steps: Strings)
    requires goal is not an empty string
    effects sets steps to set of steps outputted from an llm

setSteps (step: String) : (steps: Strings)
    requires goal is not an empty string
    effects adds step inputted by user to set of steps

completeStep (step: String): (steps: Strings)
    requires step has an in process status
    effects marks step as a status complete, records completion date
    if all steps are complete, mark Milestones as inactive

closeMilestones ()
    requires Milestones to be active
    effects marks Milestones as inactive
    
</concept_spec>
