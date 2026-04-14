import { registerMember } from 'backend/register.web';
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
      showError("Registration failed. Try again.");
      return;
    }

    const status = result.status;

    // ✅ SUCCESS → redirect based on role
    if (status === "ACTIVE") {
      redirectUser(role);
    }

    // ⚠️ EMAIL VERIFICATION REQUIRED
    else if (status === "PENDING") {
      showError("Please verify your email before continuing.");
    }

    // ❌ FALLBACK
    else {
      showError("Something went wrong. Try again.");
    }

  } catch (err) {
    console.error("Signup failed:", err);
    showError(err.message || "Signup failed");
  }
}

function redirectUser(role) {
  if (role === "family") {
    wixLocation.to("/family-onboarding");
  } 
  else if (role === "caregiver") {
    wixLocation.to("/pricing-plans/plans-pricing");
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