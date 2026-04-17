import { registerMember } from 'backend/register.web';
import { logError, logInfo } from 'backend/logger.web';
import wixLocation from 'wix-location';

$w.onReady(() => {
  $w('#errorText').hide();

  $w('#signupBtn').onClick(async () => {
    await handleSignup();
  });
});

async function handleSignup() {
  const firstName = $w('#firstName').value;
  const lastName = $w('#lastName').value;
  const email = $w('#email').value;
  const password = $w('#password').value;
  const role = $w('#roleDropdown').value;

  // ✅ Validation
  if (!firstName || !lastName || !email || !password || !role) {
    showError("Please fill all fields");
    return;
  }

  await logInfo("signUp.handleSignup", `Signup initiated for role: ${role}. Email: ${email}`);

  try {
    const result = await registerMember(
      email,
      password,
      {
        contactInfo: { firstName, lastName }
      },
      {
        firstName,
        lastName,
        role
      }
    );

    // ✅ Safety check
    if (!result || !result.member) {
      await logError("signUp.handleSignup", new Error(`Registration returned no member object. Email: ${email}, Role: ${role}`));
      showError("Registration failed. Try again.");
      return;
    }

    const memberId = result.member._id;
    const status = result.status;

    // ✅ SUCCESS → redirect based on role
    if (status === "ACTIVE") {
      await logInfo("signUp.handleSignup", `Signup SUCCESS. Status: ACTIVE. Redirecting role '${role}'.`, memberId);
      redirectUser(role);
    }

    // ⚠️ EMAIL VERIFICATION REQUIRED
    else if (status === "PENDING") {
      await logInfo("signUp.handleSignup", `Signup resulted in PENDING status. Email verification needed.`, memberId);
      showError("Please verify your email before continuing.");
    }

    // ❌ FALLBACK
    else {
      await logError("signUp.handleSignup", new Error(`Unexpected registration status: ${status}. Email: ${email}`), memberId);
      showError("Something went wrong. Try again.");
    }

  } catch (err) {
    console.error("Signup failed:", err);
    await logError("signUp.handleSignup", err);
    showError(err.message || "Signup failed");
  }
}

function redirectUser(role) {
  if (role === "family") {
    wixLocation.to("/family-onboarding");
  } 
  else if (role === "caregiver") {
    wixLocation.to("/caregiver-onboarding");
  } 
  else {
    // fallback safety
    wixLocation.to("/");
  }
}

function showError(message) {
  $w('#errorText').text = message;
  $w('#errorText').show();
}