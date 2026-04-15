# Sitting With Pride - Documentation

## 🌟 Project Overview
Sitting With Pride is a specialized premium platform designed to connect families with qualified caregivers. The application features a robust onboarding experience, subscription-gated access, and a geographical-based directory system, all built on the Wix/Velo platform.

---

## 🚀 Full System Flow Chart

```mermaid
graph TD
    %% Entry Point
    Start((Start)) --> Signup{User Signs Up}
    
    %% Role Branching
    Signup -->|Caregiver| CG_Redirect[Redirect to Pricing]
    Signup -->|Family| FM_Redirect[Redirect to Onboarding]

    %% Caregiver Path
    subgraph Caregiver_Flow [Caregiver Experience]
        CG_Redirect --> CG_Pay{Has Active Plan?}
        CG_Pay -- No --> CG_PricingPage[/Pricing Page/]
        CG_Pay -- Yes --> CG_OnboardingCheck{Onboarding Complete?}
        
        CG_OnboardingCheck -- No --> CG_Form[Multi-Step Onboarding Form]
        CG_Form --> CG_S1[Step 1: Identity & Location]
        CG_S1 --> CG_S2[Step 2: Professional Details]
        CG_S2 --> CG_S3[Step 3: Bio & Profile Photo]
        CG_S3 --> CG_Submit[Submit & Save to DB]
        
        CG_OnboardingCheck -- Yes --> CG_Applied[Show 'Already Applied' Msg]
    end

    %% Family Path
    subgraph Family_Flow [Family Experience]
        FM_Redirect --> FM_Form[Multi-Step Onboarding Form]
        FM_Form --> FM_S1[Step 1: Basics & Location]
        FM_S1 --> FM_S2[Step 2: Care Needs]
        FM_S2 --> FM_S3[Step 3: Environment & Prefs]
        FM_S3 --> FM_Submit[Submit & Save to DB]
        FM_Submit --> FM_Choice[Browse Plans / Join Directory]
    end

    %% Post-Onboarding Logic (Master Page)
    subgraph Access_Control [Global Logic - masterPage.js]
        Global((Any Page Load)) --> IsMember{Logged In?}
        IsMember -- Yes --> GetProfile[Fetch Role & Plan Status]
        
        GetProfile --> CheckCG{Role: Caregiver?}
        CheckCG -- Yes --> CG_Active{Active Plan?}
        CG_Active -- Yes --> CG_Done{Onboarding Done?}
        CG_Done -- No --> ForceCG[Force Redirect to Onboarding]
        
        GetProfile --> CheckFM{Role: Family?}
        CheckFM -- Yes --> FM_Active{Active Plan?}
        FM_Active -- Yes --> InjectMenu[Inject 'Directory' & 'Background Check' into Menu]
    end

    %% Final Access
    InjectMenu --> AccessDir[Access Caregiver Directory]
    CG_Submit --> Wait[Wait for Discovery]
```

---

## 🛠️ Technology Stack
- **Platform**: Wix
- **Frontend/Backend**: Velo (JavaScript)
- **Database**: Wix Data Collections (`UserProfiles`, etc.)
- **Location Services**: Google Maps / ZIP Geo-lookup (via `location.web.js`)
- **Payment Processing**: Wix Pricing Plans
- **Logging**: Custom cloud logger (`logger.web.js`)

---

## 🧑‍💻 Core Components

### 1. Onboarding System
- **Universal Navigation**: State-based navigation with a centralized `navigate()` logic.
- **Validation**: Strict client-side validation for every step (ZIP regex, word counts, etc.).
- **Geo-integration**: Automatic latitude/longitude retrieval based on ZIP code for proximity searching.

### 2. Access Control (The "Guard")
The `masterPage.js` handles security and UX:
- **Caregiver Gating**: Ensures paid caregivers cannot skip onboarding.
- **Family Premium Menu**: Dynamically updates the site menu to show the Directory and Background Check options only to subscribing families.

### 3. File Directory
| File | Description |
| :--- | :--- |
| `masterPage.js` | Global logic for redirects and menu injection. |
| `caregiverOnboarding.js` | UI logic for the 3-step caregiver form. |
| `familyOnboarding.js` | UI logic for the 3-step family form. |
| `onboarding.web.js` | Backend functions for data persistence and profile management. |
| `location.web.js` | Geo-services for ZIP code mapping. |
| `pricing.web.js` | Logic for plan verification. |

---

## 🛡️ Security & Performance
- **Server-Side Verification**: Role and plan checks are performed via backend web modules (`.web.js`) for security.
- **Fail-Safe Retries**: Profile fetching includes retry logic to handle potential race conditions during member creation.
- **Log Monitoring**: Integrated logging allows for real-time error tracking and warning flags for navigation issues.

---

## 📈 Future Enhancements
- [ ] Integration with background check API.
- [ ] Advanced filtering for the Caregiver Directory (distance, languages, rates).
- [ ] Direct messaging between families and caregivers.
