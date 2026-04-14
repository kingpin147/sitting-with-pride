Master UI Specification: Premium Onboarding (Universal Navigation)
This is the comprehensive design and technical blueprint for the onboarding experience. It combines granular field specifications with a centralized navigation flow using universal Next and Back buttons.

🏛️ UI Architecture
Components
Multi-State Box (#multiStateBox): Houses all form steps.
Progress Bar (#progressBar): Persistent at the top.
Navigation Footer: Contains #backBtn and #nextBtn, positioned outside the Multi-State Box.
Universal Navigation Logic
A single navigate() function handles all transitions.

Validation: Only the active state's fields are validated.
State Array: ["state1", "state2", ...] tracks the linear path.
Progress: Calculated as (index + 1) / totalStates.

🧑⚕️ Caregiver Onboarding (3 States)

State Index	State ID	Logic Context
0	stateIdentity	Back hidden. Next triggers ZIP/Geo-lookup.
1	stateProfessional	Back visible. Next triggers Form validation.
2	stateProfile	Back visible. Next triggers Media/Bio validation.

🛠️ Field Details (Caregiver)

State 1: Identity (stateIdentity)
Element ID	Type	Label	Options / Values	Validation
#firstName	Text	First Name		Required
#lastName	Text	Last Name		Required
#chosenName	Text	Chosen Name		Optional
#pronouns	Text	Pronouns		Required
#zipCode	Text	ZIP Code		5-Digit Regex

State 2: Professional (stateProfessional)
Element ID	Type	Label	Options / Values	Validation
#yearsExp	Number	Years Exp.		Required (Min 0)
#certs	Selection	Certs	CPR, First Aid, CNA, RN, Other	Required (Min 1)
#hourlyRate	Number	Hourly Rate		Required (Min 15)
#services	Checkbox	Services	Live-In, Part-Time, Travel, Overnight	Required (Min 1)

State 3: Profile (stateProfile)
Element ID	Type	Label	Options / Values	Validation
#bio	Text Box	Bio		Required (Min 100)
#languages	Tags	Languages	English, Spanish, French, Other	Required (Min 1)
#uploadPhoto	Upload	Photo		Required (JPG/PNG)

save data to database and redirect them to buy pricing plan page




👨👩👧 Family Onboarding (3 States)
State Index	State ID	Logic Context
0	stateBasics	Back hidden. Next triggers ZIP/Geo-lookup.
1	stateNeeds	Back visible. Next triggers Needs validation.
2	stateEnvironment	Back visible. Next triggers Environment validation.
🛠️ Field Details (Family)
State 1: Basics (stateBasics)
Element ID	Type	Label	Options / Values	Validation
#familyName	Text	Family Name		Required
#chosenNames	Text	Chosen Names		Optional
#zipCode	Text	ZIP Code		5-Digit Regex
State 2: Needs (stateNeeds)
Element ID	Type	Label	Options / Values	Validation
#childCount	Number	People count		Required
#childAges	Text	Ages		Required
#careType	Dropdown	Care Type	Nanny, Sitter, Pet Care, Senior Care	Required
State 3: Environment (stateEnvironment)
Element ID	Type	Label	Options / Values	Validation
#specialNeeds	Text Area	Sp. Needs		Optional
#homeNotes	Text Area	Home Notes		Optional
#preferences	Text Area	Ideal Match		Required

save data to database and redirect them to buy pricing plan page


🎨 Design System: Interactions
Button Behavior
Hover: Subtle scale (1.02) + Shadow increase.
Disabled: Lower opacity (0.5), cursor: not-allowed.
Focus: Accessibility outline in Primary Indigo.
Transition Effect
Multi-State Box Animation: Slide Horizontal (duration: 300ms).
User Review Required
IMPORTANT

Since we use a Single Next Button, we will implement a "State Router" in Velo. This router will dynamically determine which validation function to call based on the active state before allowing progress.

TIP

This structure is much more scalable. If you ever add a new step, we just add the state ID to the states array and the UI handles the rest.

Next Steps
Approval: Confirm if this master plan covers all your requirements.
Code Implementation: I will write the centralized Velo logic for both pages.
CSS Customization: I will provide the premium styling for the universal buttons and footer.


Final Integrated Onboarding & Directory Flows
This flowchart reflects the actual code implementation using the Master Page for global navigation control and the pricing-gated logic for caregivers.

🚀 Caregiver Onboarding & Pricing Flow
⚠️ Failed to render Mermaid diagram: Parse error on line 5
graph TD
    A[<b>Signup Page</b>] --> B[Caregiver Signs Up]
    B --> C[<b>Redirect: /pricing-plans/plans-pricing</b>]
    
    subgraph Site-Wide Logic (masterPage.js)
    D[User on Any Site Page] --> E{isMember?}
    E -- Yes --> F[Fetch Role & Plan Status]
    F --> G{role == 'caregiver'?}
    G -- Yes --> H{Has Active Plan?}
    H -- Yes --> I{onboardingCompleted?}
    I -- No --> J[<b>AUTO-REDIRECT: /caregiver-onboarding</b>]
    end

    J --> K{Caregiver Onboarding Page}
    K --> L{onboardingCompleted?}
    L -- Yes --> M[Display: 'You have already applied...']
    L -- No --> N[Show Multi-Step Form]
    N --> O[User Submits Form]
    O --> P[Start Photo Upload]
    P --> Q[Save Profile to Database]
    Q --> R[Complete Onboarding in UserProfiles]
    R --> S[Redirect to Final Success/Plans Page]
🏠 Family Onboarding & Directory Access
⚠️ Failed to render Mermaid diagram: Parse error on line 5
graph TD
    A[<b>Signup Page</b>] --> B[Family Member Signs Up]
    B --> C[<b>Redirect: /family-onboarding</b>]
    
    subgraph Site-Wide UI (masterPage.js)
    D[User on Any Site Page] --> E{isMember?}
    E -- Yes --> F[Check Role & Plan Status]
    F --> G{role == 'family'?}
    G -- Yes --> H{Has Active Plan?}
    H -- Yes --> I[<b>Inject Items into #menu1:</b><br/>1. Care Givers Directory<br/>2. Background Check]
    end

    I --> J[User clicks 'Care Givers Directory']
    J --> K{/caregiver-directory Page}
    K --> L{Check: Family + Has Plan?}
    L -- Yes --> M[Fetch & Display Caregiver Repeater]
    L -- No --> N[Deny Access / Show Subscribe Notice]
🔑 Integrated Access Controls (Summary)
IMPORTANT

1. Unified Entry: All users go through masterPage.js logic which acts as a "Site Router" based on their DB role and subscription status. 2. Caregiver Gating: Caregivers are locked into the Pricing page until they pay, at which point the Master Page force-redirects them to Onboarding. 3. Family Premium Menu: Features like the Directory and Background Check only appear in the menu once a plan is active. 4. Single Entry Prevention: The onboardingCompleted flag prevents caregivers from re-submitting profiles and instead shows a "Wait for contact" message.

Refining Marketplace Onboarding Logic
Continue


I have successfully implemented all the requested features and security controls for the "Sitting With Pride" platform.

✅ Final Implementation Summary:
Caregiver Flow Gating:

Signup Redirection: Caregivers are now sent directly to the Pricing page after signup.
Proactive Redirection: The 

masterPage.js
 now detects 