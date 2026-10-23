
"use strict";

// FFineXX — Supabase connection
const SUPABASE_URL = "https://ogzkrakaypfhowkgvvzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uzizmRLBZehb_4MkQcgqEg_DPQ0pyKl";

if (!window.supabase) {
  alert("FFineXX could not load its account service. Refresh the page and try again.");
  throw new Error("Supabase library did not load.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const accountDialog = $("accountDialog");
  const noticeDialog = $("noticeDialog");
  const accountStatus = $("accountStatus");
  const signupForm = $("signupForm");
  const loginForm = $("loginForm");
  const phoneLoginForm = $("phoneLoginForm");
  const profileSettings = $("profileSettings");
  const switchAccountMode = $("switchAccountMode");
  const switchPhoneMode = $("switchPhoneMode");

  let accountMode = "signup";
  let phoneVerificationSent = false;

  function showNotice(title, message) {
    if ($("dialogTitle")) $("dialogTitle").textContent = title;
    if ($("dialogMessage")) $("dialogMessage").textContent = message;

    if (noticeDialog && !noticeDialog.open) {
      noticeDialog.showModal();
    } else if (!noticeDialog) {
      alert(title + "\n\n" + message);
    }
  }

  function closeNotice() {
    if (noticeDialog?.open) noticeDialog.close();
  }

  $("closeDialog")?.addEventListener("click", closeNotice);
  $("dialogOkay")?.addEventListener("click", closeNotice);

  noticeDialog?.addEventListener("click", (event) => {
    if (event.target === noticeDialog) closeNotice();
  });

  function setStatus(message, isError = false) {
    if (!accountStatus) return;
    accountStatus.textContent = message;
    accountStatus.style.color = isError ? "#ff7b91" : "#d7b5ff";
  }

  function setAccountMode(mode) {
    accountMode = mode;

    if (signupForm) signupForm.hidden = mode !== "signup";
    if (loginForm) loginForm.hidden = mode !== "login";
    if (phoneLoginForm) phoneLoginForm.hidden = mode !== "phone";
    if (profileSettings) profileSettings.hidden = true;

    if ($("accountTitle")) {
      $("accountTitle").textContent = {
        signup: "Join FFineXX",
        login: "Welcome back",
        phone: "Log in with phone",
        profile: "Your profile"
      }[mode] || "Your FFineXX account";
    }

    if ($("accountDescription")) {
      $("accountDescription").textContent = {
        signup: "Create your account and join the community.",
        login: "Log in to continue to FFineXX.",
        phone: "We'll send a verification code by SMS.",
        profile: "Manage your FFineXX account."
      }[mode] || "";
    }

    if (switchAccountMode) {
      switchAccountMode.hidden = mode === "phone" || mode === "profile";
      switchAccountMode.textContent =
        mode === "signup"
          ? "Already have an account? Log in"
          : "New to FFineXX? Create an account";
    }

    if (switchPhoneMode) {
      switchPhoneMode.hidden = mode === "phone" || mode === "profile";
    }

    const googleButton = $("googleSignInBtn");
    if (googleButton) googleButton.hidden = mode === "profile";

    setStatus("");
  }

  function openAccount(mode = "signup") {
    setAccountMode(mode);
    if (accountDialog && !accountDialog.open) accountDialog.showModal();
  }

  function closeAccount() {
    if (accountDialog?.open) accountDialog.close();
  }

  $("closeAccountDialog")?.addEventListener("click", closeAccount);

  accountDialog?.addEventListener("click", (event) => {
    if (event.target === accountDialog) closeAccount();
  });

  switchAccountMode?.addEventListener("click", () => {
    setAccountMode(accountMode === "signup" ? "login" : "signup");
  });

  switchPhoneMode?.addEventListener("click", () => {
    setAccountMode("phone");
  });

  // Update the visible page when authentication changes.
  function updateSignedInUI(user) {
    const loggedIn = Boolean(user);

    if ($("loginBtn")) $("loginBtn").hidden = loggedIn;
    if ($("joinBtn")) $("joinBtn").hidden = loggedIn;
    if ($("bannerJoinBtn")) $("bannerJoinBtn").hidden = loggedIn;
    if ($("profileBtn")) $("profileBtn").hidden = !loggedIn;

    const displayName =
      user?.user_metadata?.display_name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "FFineXX member";

    const username = user?.user_metadata?.username || "";

    if ($("profileDisplayName")) {
      $("profileDisplayName").textContent = displayName;
    }

    if ($("profileUsername")) {
      $("profileUsername").textContent = username ? "@" + username : "";
    }

    const mobileAccount = $("mobileLoginBtn");
    if (mobileAccount) {
      mobileAccount.innerHTML = loggedIn
        ? "♙<span>Profile</span>"
        : "♙<span>Account</span>";
    }
  }

  // EMAIL SIGN-UP
  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = $("signupName")?.value.trim() || "";
    const username = $("signupUsername")?.value.trim().toLowerCase() || "";
    const birthday = $("signupBirthday")?.value || "";
    const country = $("signupCountry")?.value || "";
    const phone = $("signupPhone")?.value.trim() || "";
    const email = $("signupEmail")?.value.trim() || "";
    const password = $("signupPassword")?.value || "";

    if (!name || !username || !birthday || !country || !email || !password) {
      setStatus("Please complete all required fields.", true);
      return;
    }

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setStatus("Username must be 3–24 characters: letters, numbers or underscores.", true);
      return;
    }

    if (password.length < 8) {
      setStatus("Password must contain at least 8 characters.", true);
      return;
    }

    const birthDate = new Date(birthday + "T00:00:00");
    const today = new Date();
    if (Number.isNaN(birthDate.getTime()) || birthDate >= today) {
      setStatus("Please enter a valid birthday in the past.", true);
      return;
    }

    const button = $("signupSubmit");
    if (button) {
      button.disabled = true;
      button.textContent = "Creating account...";
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            username,
            birthday,
            country,
            phone: phone || null
          }
        }
      });

      if (error) throw error;

      signupForm.reset();

      if (data.session && data.user) {
        updateSignedInUI(data.user);
        setStatus("Your account was created successfully!");
        setTimeout(closeAccount, 1000);
      } else {
        setStatus("Account request received. Check your email for a confirmation link before logging in.");
      }
    } catch (error) {
      setStatus(error.message || "Could not create your account.", true);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Create account";
      }
    }
  });

  // EMAIL LOGIN
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = $("loginEmail")?.value.trim() || "";
    const password = $("loginPassword")?.value || "";
    const button = $("loginSubmit");

    if (button) {
      button.disabled = true;
      button.textContent = "Logging in...";
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      updateSignedInUI(data.user);
      setStatus("You're logged in successfully!");
      loginForm.reset();
      setTimeout(closeAccount, 800);
    } catch (error) {
      setStatus(error.message || "Login failed. Check your details.", true);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Log in";
      }
    }
  });

  // GOOGLE SIGN-IN — Google must first be enabled in Supabase.
  $("googleSignInBtn")?.addEventListener("click", async () => {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      setStatus(error.message || "Google sign-in could not start.", true);
    }
  });

  // PHONE SIGN-IN — SMS phone authentication must be enabled in Supabase.
  phoneLoginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const phone = $("phoneLoginNumber")?.value.trim() || "";
    const button = $("sendPhoneCodeBtn");

    if (!phone.startsWith("+") || phone.length < 8) {
      setStatus("Enter your full phone number with country code, e.g. +256...", true);
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Sending code...";
    }

    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        phone
      });

      if (error) throw error;

      phoneVerificationSent = true;
      setStatus("If SMS sign-in is configured, your verification code is on its way.");
    } catch (error) {
      setStatus(error.message || "Could not send the verification code.", true);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Send verification code";
      }
    }
  });

  $("verifyPhoneCodeBtn")?.addEventListener("click", async () => {
    const phone = $("phoneLoginNumber")?.value.trim() || "";
    const token = $("phoneLoginCode")?.value.trim() || "";

    if (!phoneVerificationSent || !token) {
      setStatus("Request a verification code and enter it first.", true);
      return;
    }

    const button = $("verifyPhoneCodeBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "Verifying...";
    }

    try {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        phone,
        token,
        type: "sms"
      });

      if (error) throw error;

      updateSignedInUI(data.user);
      setStatus("Phone verified. You're logged in!");
      phoneLoginForm.reset();
      phoneVerificationSent = false;
      setTimeout(closeAccount, 800);
    } catch (error) {
      setStatus(error.message || "The code could not be verified.", true);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Verify code";
      }
    }
  });

  // PROFILE / SETTINGS / ADD ACCOUNT
  function showProfile() {
    setAccountMode("profile");
    if (signupForm) signupForm.hidden = true;
    if (loginForm) loginForm.hidden = true;
    if (phoneLoginForm) phoneLoginForm.hidden = true;
    if (profileSettings) profileSettings.hidden = false;

    if ($("accountTitle")) $("accountTitle").textContent = "Your profile";
    if ($("accountDescription")) {
      $("accountDescription").textContent = "Manage your FFineXX account.";
    }
    if (switchAccountMode) switchAccountMode.hidden = true;
    if (switchPhoneMode) switchPhoneMode.hidden = true;
    if ($("googleSignInBtn")) $("googleSignInBtn").hidden = true;
    openAccount("profile");
  }

  $("profileBtn")?.addEventListener("click", showProfile);
  $("mobileLoginBtn")?.addEventListener("click", () => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data.user) showProfile();
      else openAccount("signup");
    });
  });

  $("profileSettingsBtn")?.addEventListener("click", () => {
    showNotice(
      "Profile settings",
      "Your display name, username, birthday and country are currently stored in your account metadata. Editable profile settings will be added in a later step."
    );
  });

  $("addAccountBtn")?.addEventListener("click", async () => {
    const confirmed = confirm(
      "Adding another account may replace the active login in this browser. Continue to the sign-up screen?"
    );
    if (confirmed) setAccountMode("signup");
  });

  $("logoutBtn")?.addEventListener("click", async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;

      updateSignedInUI(null);
      closeAccount();
      showNotice("Logged out", "You have logged out of FFineXX.");
    } catch (error) {
      setStatus(error.message || "Could not log out.", true);
    }
  });

  $("loginBtn")?.addEventListener("click", () => openAccount("login"));
  $("joinBtn")?.addEventListener("click", () => openAccount("signup"));
  $("bannerJoinBtn")?.addEventListener("click", () => openAccount("signup"));
  $("createBtn")?.addEventListener("click", () => setActiveView("Upload"));

  $("supportBtn")?.addEventListener("click", () => {
    showNotice("FFineXX Support", "Community help and support will be connected in a later step.");
  });

  // NAVIGATION
  const featureMessages = {
    "For You": ["For You", "Fresh videos, new creators, endless inspiration."],
    "Following": ["Following", "Your followed creators will appear here when the video feed is connected."],
    "Explore": ["Explore FFineXX", "Discover creators, music, trends, and communities."],
    "LIVE": ["FFineXX LIVE", "Live streaming needs a streaming service and server integration."],
    "Messages": ["Messages", "Private messaging will be added with secure accounts."],
    "Notifications": ["Notifications", "Your creator and account notifications will appear here."],
    "Upload": ["Create a video", "Video uploads need secure storage and video-feed integration."],
    "Studio": ["Creator Studio", "Creator analytics and video management will be built here."],
    "Templates": ["Video templates", "Editing tools and templates will be connected in a later step."],
    "Status": ["Status & Highlights", "Temporary posts and profile highlights will be added later."],
    "Trending": ["Trending", "Trending videos will appear when real video data is connected."],
    "Music": ["Music", "Music discovery will be connected in a later step."]
  };

  function setActiveView(view) {
    const details = featureMessages[view] || [
      view,
      "This FFineXX feature will be connected in a future step."
    ];

    document.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });

    document.querySelectorAll(".tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.feed === view);
    });

    const heading = $("pageTitle");
    const subtitle = $("pageSubtitle");

    if (heading && subtitle) {
      if (view === "For You") {
        heading.innerHTML = 'Discover your next <span class="pink">favourite.</span>';
        subtitle.textContent = "Fresh videos, new creators, endless inspiration.";
      } else {
        heading.textContent = details[0];
        subtitle.textContent = details[1];
      }
    }

    if (!["For You", "Following", "Trending", "Music"].includes(view)) {
      showNotice(details[0], details[1]);
    }
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id === "mobileLoginBtn") return;
      setActiveView(button.dataset.view);
    });
  });

  document.querySelectorAll("[data-feed]").forEach((button) => {
    button.addEventListener("click", () => {
      const feed = button.dataset.feed;
      setActiveView(feed);
      if (feed !== "For You") {
        showNotice(feed, "This feed will show personalized videos after video data is connected.");
      }
    });
  });

  document.querySelectorAll('[data-action="like"]').forEach((button) => {
    button.addEventListener("click", () => {
      const liked = button.classList.toggle("liked");
      button.innerHTML = liked ? "♥ <span>Liked</span>" : "♡ <span>Like</span>";
      button.setAttribute("aria-pressed", String(liked));
    });
  });

  document.querySelectorAll(".follow-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const following = button.classList.toggle("following");
      button.textContent = following ? "Following" : "Follow";
      button.setAttribute("aria-pressed", String(following));
    });
  });

  document.querySelectorAll('[data-action="comment"]').forEach((button) => {
    button.addEventListener("click", () => {
      showNotice("Comments", "Comments will be connected to the database in a later step.");
    });
  });

  document.querySelectorAll('[data-action="share"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const shareData = {
        title: "FFineXX",
        text: "Discover creators on FFineXX.",
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href);
          showNotice("Link copied", "The FFineXX page link was copied.");
        } else {
          showNotice("Share FFineXX", window.location.href);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          showNotice("Share FFineXX", window.location.href);
        }
      }
    });
  });

  $("searchInput")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const query = $("searchInput").value.trim();

    if (!query) {
      showNotice("Search FFineXX", "Type a creator or topic to search.");
      return;
    }

    showNotice("Search", 'Searching for "' + query + '" will work when creator and video search is connected.');
  });

  // Restore existing login and keep the buttons synchronized.
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Could not restore FFineXX session:", error.message);
      return;
    }
    updateSignedInUI(data.session?.user || null);
  });

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    updateSignedInUI(session?.user || null);
  });
});
