import wixWindowFrontend from 'wix-window-frontend';
import { currentMember } from 'wix-members-frontend';
import { getUserProfile } from 'backend/onboarding.web';
import { saveConnectionRequest } from 'backend/requests.web';

let recipientData = null;
let senderProfile = null;

$w.onReady(async function () {
    recipientData = wixWindowFrontend.lightbox.getContext();
    
    if (recipientData) {
        $w('#titleText').text = `Request to connect with ${recipientData.recipientName}`;
    }

    // Set Disclaimer text
    if ($w('#disclaimerText')) {
        $w('#disclaimerText').text = "Sitting With Pride facilitates connections and does not guarantee the accuracy of background checks or user information.";
    }

    // Get sender info
    const member = await currentMember.getMember();
    if (member) {
        senderProfile = await getUserProfile(member._id);
        
        // Auto-fill form if possible
        if (senderProfile) {
            if ($w('#nameInput')) $w('#nameInput').value = senderProfile.fullName;
            if ($w('#emailInput')) $w('#emailInput').value = member.loginEmail || senderProfile.email || "";
        }
    }

    $w('#submitBtn').onClick(async () => {
        $w('#submitBtn').disable();
        $w('#submitBtn').label = "Sending...";

        const name = $w('#nameInput').value;
        const email = $w('#emailInput').value;
        const whoToConnect = $w('#whoInput').value;
        const lookingFor = $w('#lookingForInput').value;
        const extraInfo = $w('#extraInfoInput').value;

        if (!name || !email || !whoToConnect || !lookingFor) {
            showError("Please fill out all required fields.");
            $w('#submitBtn').enable();
            $w('#submitBtn').label = "Submit Request";
            return;
        }

        try {
            await saveConnectionRequest({
                senderUserId: member ? member._id : "Guest",
                recipientUserId: recipientData.recipientId,
                senderName: name,
                senderEmail: email,
                recipientName: recipientData.recipientName,
                recipientEmail: recipientData.recipientEmail,
                whoToConnect: whoToConnect,
                lookingFor: lookingFor,
                extraInfo: extraInfo
            });

            // Show success and close
            $w('#submitBtn').label = "Sent!";
            setTimeout(() => {
                wixWindowFrontend.lightbox.close({ success: true });
            }, 1500);
            
        } catch (err) {
            console.error(err);
            showError("Failed to submit request. Please try again.");
            $w('#submitBtn').enable();
            $w('#submitBtn').label = "Submit Request";
        }
    });

    $w('#cancelBtn').onClick(() => {
        wixWindowFrontend.lightbox.close();
    });
});

function showError(msg) {
    if ($w('#errorText')) {
        $w('#errorText').text = msg;
        $w('#errorText').show();
        setTimeout(() => $w('#errorText').hide(), 5000);
    }
}
