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
