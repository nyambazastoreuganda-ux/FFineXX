
"use strict";

const SUPABASE_URL = "https://ogzkrakaypfhowkgvvzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uzizmRLBZehb_4MkQcgqEg_DPQ0pyKl";

if (!window.supabase) {
  alert("FFineXX account service failed to load. Refresh the page.");
  throw new Error("Supabase library unavailable.");
}

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const accountDialog = $("accountDialog");
  const noticeDialog = $("noticeDialog");

  let currentUser = null;
  window.ffineXXUserSignedIn = false;

  let mode = "signup";
  let previousAccountMode = "profile";

  function status(message, error = false) {
    const el = $("accountStatus");
    if (el) {
      el.textContent = message;
      el.style.color = error ? "#ff819b" : "#d6b8ff";
    }
  }

  function notice(title, message) {
    if ($("dialogTitle")) $("dialogTitle").textContent = title;
    if ($("dialogMessage")) $("dialogMessage").textContent = message;

    if (noticeDialog && !noticeDialog.open) {
      noticeDialog.showModal();
    }
  }

  function closeAccount() {
    if (accountDialog && accountDialog.open) {
      accountDialog.close();
    }
  }

  function hidePanels() {
    [
      "signupForm",
      "loginForm",
      "profileSettings",
      "settingsPanel",
      "dashboardPanel",
      "studioPanel"
    ].forEach(id => {
      if ($(id)) $(id).hidden = true;
    });
  }

  function setMode(next) {
    mode = next;
    hidePanels();

    const panelIds = {
      signup: "signupForm",
      login: "loginForm",
      profile: "profileSettings",
      settings: "settingsPanel",
      dashboard: "dashboardPanel",
      studio: "studioPanel"
    };

    if (panelIds[next] && $(panelIds[next])) {
      $(panelIds[next]).hidden = false;
    }

    if ($("accountTitle")) {
      $("accountTitle").textContent = ({
        signup: "Create your account",
        login: "Welcome back",
        profile: "Your profile",
        settings: "Account settings",
        dashboard: "Creator dashboard",
        studio: "Creator Studio"
      })[next] || "FFineXX";
    }

    if ($("accountDescription")) {
      $("accountDescription").textContent = ({
        signup: "Join creators and communities on FFineXX.",
        login: "Log in to continue to FFineXX.",
        profile: "Manage your FFineXX account.",
        settings: "Manage your personal profile details.",
        dashboard: "Your creator overview.",
        studio: "Your creative workspace."
      })[next] || "";
    }

    if ($("authTabs")) {
      $("authTabs").hidden = !["signup", "login"].includes(next);
    }

    if ($("googleSignInBtn")) {
      $("googleSignInBtn").hidden = !["signup", "login"].includes(next);
    }

    status("");
  }

  function openAccount(next = "signup") {
    if (!accountDialog) return;

    setMode(next);

    if (!accountDialog.open) {
      accountDialog.showModal();
    }
  }

  function showProfile() {
    if (!currentUser) {
      openAccount("signup");
      return;
    }

    previousAccountMode = "profile";
    fillProfile();
    openAccount("profile");
  }

  function fillProfile() {
    if (!currentUser) return;

    const meta = currentUser.user_metadata || {};

    if ($("profileDisplayName")) {
      $("profileDisplayName").textContent =
        meta.display_name ||
        meta.full_name ||
        currentUser.email ||
        "FFineXX member";
    }

    if ($("profileUsername")) {
      $("profileUsername").textContent =
        meta.username
          ? "@" + meta.username
          : currentUser.email || "";
    }

    if ($("editDisplayName")) {
      $("editDisplayName").value =
        meta.display_name || meta.full_name || "";
    }

    if ($("editUsername")) {
      $("editUsername").value = meta.username || "";
    }
  }

  // Keep the website's login state synchronized.
  // The video creator interface uses this global flag.
  function updateUI(user) {
    currentUser = user || null;
    window.ffineXXUserSignedIn = Boolean(currentUser);

    const signedIn = Boolean(currentUser);

    ["loginBtn", "joinBtn", "bannerJoinBtn"].forEach(id => {
      if ($(id)) $(id).hidden = signedIn;
    });

    if ($("profileBtn")) {
      $("profileBtn").hidden = !signedIn;
    }

    if ($("mobileLoginBtn")) {
      $("mobileLoginBtn").innerHTML = signedIn
        ? "♙<span>Profile</span>"
        : "♙<span>Account</span>";
    }

    if (signedIn) {
      fillProfile();
    }
  }

  function requireLogin(action) {
    if (!currentUser) {
      notice("Join FFineXX", `Log in or create an account to ${action}.`);
      openAccount("signup");
      return false;
    }

    return true;
  }

  // Account dialogs and navigation.
  if ($("closeAccountDialog")) {
    $("closeAccountDialog").addEventListener("click", closeAccount);
  }

  if ($("closeNoticeDialog")) {
    $("closeNoticeDialog").addEventListener("click", () => {
      if (noticeDialog) noticeDialog.close();
    });
  }

  if ($("dialogOkay")) {
    $("dialogOkay").addEventListener("click", () => {
      if (noticeDialog) noticeDialog.close();
    });
  }

  if ($("showSignup")) {
    $("showSignup").addEventListener("click", () => setMode("signup"));
  }

  if ($("showLogin")) {
    $("showLogin").addEventListener("click", () => setMode("login"));
  }

  if ($("loginBtn")) {
    $("loginBtn").addEventListener("click", () => openAccount("login"));
  }

  if ($("joinBtn")) {
    $("joinBtn").addEventListener("click", () => openAccount("signup"));
  }

  if ($("bannerJoinBtn")) {
    $("bannerJoinBtn").addEventListener("click", () => openAccount("signup"));
  }

  if ($("profileBtn")) {
    $("profileBtn").addEventListener("click", showProfile);
  }

  if ($("mobileLoginBtn")) {
    $("mobileLoginBtn").addEventListener("click", showProfile);
  }

  if ($("createBtn")) {
    $("createBtn").addEventListener("click", () => {
      if (requireLogin("post videos")) openAccount("studio");
    });
  }

  // Sign up.
  if ($("signupForm")) {
    $("signupForm").addEventListener("submit", async event => {
      event.preventDefault();

      const displayName = $("signupName").value.trim();
      const username = $("signupUsername").value.trim().toLowerCase();
      const country = $("signupCountry").value;
      const phone = $("signupPhone").value.trim();
      const email = $("signupEmail").value.trim();
      const password = $("signupPassword").value;

      if (!/^[a-z0-9_]{3,24}$/.test(username)) {
        status(
          "Username must be 3–24 characters: letters, numbers and underscores.",
          true
        );
        return;
      }

      const button = $("signupSubmit");
      button.disabled = true;
      button.textContent = "Creating account...";

      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              username,
              country,
              phone: phone || null
            }
          }
        });

        if (error) throw error;

        if (data.session && data.user) {
          updateUI(data.user);
          status("Welcome to FFineXX!");
          setTimeout(closeAccount, 900);
        } else {
          status(
            "Check your email for the confirmation link, then log in."
          );
        }
      } catch (err) {
        status(err.message || "Signup failed.", true);
      } finally {
        button.disabled = false;
        button.textContent = "Create account";
      }
    });
  }

  // Log in.
  if ($("loginForm")) {
    $("loginForm").addEventListener("submit", async event => {
      event.preventDefault();

      const button = $("loginSubmit");
      button.disabled = true;
      button.textContent = "Logging in...";

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: $("loginEmail").value.trim(),
          password: $("loginPassword").value
        });

        if (error) throw error;

        updateUI(data.user);
        status("Logged in successfully!");
        setTimeout(closeAccount, 700);
      } catch (err) {
        status(err.message || "Login failed.", true);
      } finally {
        button.disabled = false;
        button.textContent = "Log in";
      }
    });
  }

  // Google sign-in requires Google OAuth to be configured in Supabase.
  if ($("googleSignInBtn")) {
    $("googleSignInBtn").addEventListener("click", async () => {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) status(error.message, true);
    });
  }

  // Profile and creator navigation.
  if ($("profileSettingsBtn")) {
    $("profileSettingsBtn").addEventListener("click", () => {
      setMode("settings");
    });
  }

  if ($("dashboardBtn")) {
    $("dashboardBtn").addEventListener("click", () => {
      setMode("dashboard");
    });
  }

  if ($("studioBtn")) {
    $("studioBtn").addEventListener("click", () => {
      setMode("studio");
    });
  }

  if ($("backToProfileBtn")) {
    $("backToProfileBtn").addEventListener("click", () => {
      setMode("profile");
    });
  }

  if ($("backFromDashboardBtn")) {
    $("backFromDashboardBtn").addEventListener("click", () => {
      setMode("profile");
    });
  }

  if ($("backFromStudioBtn")) {
    $("backFromStudioBtn").addEventListener("click", () => {
      setMode("profile");
    });
  }

  // Save profile settings.
  if ($("profileEditForm")) {
    $("profileEditForm").addEventListener("submit", async event => {
      event.preventDefault();

      if (!currentUser) return;

      const display_name = $("editDisplayName").value.trim();
      const username = $("editUsername").value.trim().toLowerCase();

      if (!/^[a-z0-9_]{3,24}$/.test(username)) {
        notice(
          "Invalid username",
          "Use 3–24 letters, numbers or underscores."
        );
        return;
      }

      try {
        const { data, error } = await client.auth.updateUser({
          data: {
            ...currentUser.user_metadata,
            display_name,
            username
          }
        });

        if (error) throw error;

        updateUI(data.user);
        notice("Profile updated", "Your profile information was saved.");
        setMode("profile");
      } catch (err) {
        notice("Could not save", err.message);
      }
    });
  }

  // Switch account.
  if ($("addAccountBtn")) {
    $("addAccountBtn").addEventListener("click", async () => {
      const confirmed = confirm(
        "Switching accounts will sign out this account first. Continue?"
      );

      if (!confirmed) return;

      const { error } = await client.auth.signOut();

      if (error) {
        status(error.message, true);
        return;
      }

      updateUI(null);
      setMode("signup");
    });
  }

  // Log out.
  if ($("logoutBtn")) {
    $("logoutBtn").addEventListener("click", async () => {
      const { error } = await client.auth.signOut();

      if (error) {
        status(error.message, true);
        return;
      }

      updateUI(null);
      closeAccount();

      notice("Logged out", "You have safely logged out of FFineXX.");
    });
  }

  // Publishing still needs video storage and database integration.
  if ($("studioUploadBtn")) {
    $("studioUploadBtn").addEventListener("click", () => {
      notice(
        "Video publishing",
        "The upload screen will be enabled after secure video storage and the publishing database are connected."
      );
    });
  }

  // Main navigation.
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;

      if (
        ["Upload", "Studio", "Dashboard", "Settings"].includes(view) &&
        !requireLogin("use creator tools")
      ) {
        return;
      }

      const titles = {
        "For You": [
          "Discover your next favourite.",
          "Watch public videos without an account."
        ],
        Following: [
          "Following",
          "Sign in to follow creators."
        ],
        Explore: [
          "Explore FFineXX",
          "Discover creators, music and stories."
        ],
        Upload: [
          "Create a video",
          "Video publishing needs connected storage."
        ],
        Dashboard: [
          "Creator dashboard",
          "Review your creator activity."
        ],
        Studio: [
          "Creator Studio",
          "Manage your creative workflow."
        ],
        Settings: [
          "Account settings",
          "Manage your profile."
        ]
      };

      const details = titles[view] || [view, "Discover FFineXX."];

      if ($("pageTitle")) $("pageTitle").textContent = details[0];
      if ($("pageSubtitle")) $("pageSubtitle").textContent = details[1];

      document.querySelectorAll("[data-view]").forEach(item => {
        item.classList.toggle("active", item.dataset.view === view);
      });

      if (view === "Upload" || view === "Studio") {
        openAccount("studio");
      }

      if (view === "Dashboard") openAccount("dashboard");
      if (view === "Settings") openAccount("settings");
    });
  });

  // Feed filters.
  document.querySelectorAll("[data-feed]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-feed]").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      if (button.dataset.feed !== "For You") {
        notice(
          button.dataset.feed,
          "Personalized video feeds will be connected to real video data."
        );
      }
    });
  });

  // Like, favourite and share.
  document.querySelectorAll(
    '[data-action="like"], [data-action="favorite"], [data-action="share"]'
  ).forEach(button => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;

      const actionText = {
        like: "like videos",
        favorite: "save favourites",
        share: "share videos"
      };

      if (!requireLogin(actionText[action] || "use this feature")) {
        return;
      }

      if (action === "share") {
        try {
          if (navigator.share) {
            await navigator.share({
              title: "FFineXX",
              url: window.location.href
            });
          } else {
            await navigator.clipboard.writeText(window.location.href);
            notice(
              "Link copied",
              "Share this FFineXX link with your friends."
            );
          }
        } catch (err) {
          if (err.name !== "AbortError") {
            notice("Share FFineXX", window.location.href);
          }
        }
      } else {
        notice(
          action === "like" ? "Like" : "Favourite",
          "Persistent likes and favourites will work after the video database tables are connected."
        );
      }
    });
  });

  // Search.
  if ($("searchInput")) {
    $("searchInput").addEventListener("keydown", event => {
      if (event.key === "Enter") {
        const q = $("searchInput").value.trim();

        notice(
          "Search FFineXX",
          q
            ? `Search for "${q}" will be connected to creator and video data.`
            : "Type a creator or topic to search."
        );
      }
    });
  }

  // Restore the saved login session.
  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error(error.message);
      return;
    }

    updateUI(data.session?.user || null);
  });

  // Keep login status updated after sign-in or sign-out.
  client.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user || null);
  });
});
