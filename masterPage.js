import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';
import { getUserProfile } from 'backend/onboarding.web';
import { hasAnyActivePlan } from 'backend/pricing.web';

$w.onReady(async function () {
    const member = await currentMember.getMember();
    if (!member) return;

    try {
        const [profile, hasPlan] = await Promise.all([
            getUserProfile(member._id),
            hasAnyActivePlan()
        ]);

        if (!profile) return;

        const path = wixLocationFrontend.path;

        // 🛡️ Caregiver Redirection Logic
        if (profile.role === 'caregiver' && hasPlan && !profile.onboardingCompleted) {
            // If not already on the onboarding page, redirect them
            if (!path.includes('caregiver-onboarding')) {
                console.log("Redirecting new caregiver with plan to onboarding...");
                wixLocationFrontend.to('/caregiver-onboarding');
            }
        }

        // 🏠 Family Redirection Logic
        if (profile.role === 'family' && !profile.onboardingCompleted) {
            if (!path.includes('family-onboarding')) {
                console.log("Redirecting family to onboarding...");
                wixLocationFrontend.to('/family-onboarding');
            }
        }

        // 🏠 Family Menu Item Logic
        if (profile.role === 'family' && hasPlan) {
            const menu = $w('#menu1');
            if (menu) {
                let menuItems = menu.menuItems;
                
                // Add Care Givers Directory if not exists
                const directoryExists = menuItems.some(item => item.label === "Care Givers Directory" || item.link === "/caregiver-directory");
                if (!directoryExists) {
                    menuItems.push({
                        label: "Care Givers Directory",
                        link: "/caregiver-directory",
                        id: "caregiver-directory-link",
                        selected: false
                    });
                }

                // Add Background Check if not exists
                const bgCheckExists = menuItems.some(item => item.label === "Background Check" || item.link === "/bgchecker");
                if (!bgCheckExists) {
                    menuItems.push({
                        label: "Background Check",
                        link: "/bgchecker",
                        id: "bg-check-link",
                        selected: false
                    });
                }

                menu.menuItems = menuItems;
            }
        }

    } catch (err) {
        console.error("Master Page Logic Error:", err);
    }
});
