
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
    $("dialogTitle").textContent = title;
    $("dialogMessage").textContent = message;
    if (!noticeDialog.open) noticeDialog.showModal();
  }

  function closeAccount() {
    if (accountDialog.open) accountDialog.close();
  }

  function hidePanels() {
    [
      "signupForm", "loginForm", "profileSettings",
      "settingsPanel", "dashboardPanel", "studioPanel"
    ].forEach(id => {
      if ($(id)) $(id).hidden = true;
    });
  }

  function setMode(next) {
    mode = next;
    hidePanels();

    if (next === "signup") $("signupForm").hidden = false;
    if (next === "login") $("loginForm").hidden = false;
    if (next === "profile") $("profileSettings").hidden = false;
    if (next === "settings") $("settingsPanel").hidden = false;
    if (next === "dashboard") $("dashboardPanel").hidden = false;
    if (next === "studio") $("studioPanel").hidden = false;

    $("accountTitle").textContent = ({
      signup: "Create your account",
      login: "Welcome back",
      profile: "Your profile",
      settings: "Account settings",
      dashboard: "Creator dashboard",
      studio: "Creator Studio"
    })[next] || "FFineXX";

    $("accountDescription").textContent = ({
      signup: "Join creators and communities on FFineXX.",
      login: "Log in to continue to FFineXX.",
      profile: "Manage your FFineXX account.",
      settings: "Manage your personal profile details.",
      dashboard: "Your creator overview.",
      studio: "Your creative workspace."
    })[next] || "";

    $("authTabs").hidden = !["signup", "login"].includes(next);
    $("googleSignInBtn").hidden = !["signup", "login"].includes(next);
    status("");
  }

  function openAccount(next = "signup") {
    setMode(next);
    if (!accountDialog.open) accountDialog.showModal();
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
    $("profileDisplayName").textContent =
      meta.display_name || meta.full_name || currentUser.email || "FFineXX member";
    $("profileUsername").textContent =
      meta.username ? "@" + meta.username : currentUser.email || "";
    $("editDisplayName").value =
      meta.display_name || meta.full_name || "";
    $("editUsername").value = meta.username || "";
  }

  function updateUI(user) {
    currentUser = user || null;
    const signedIn = Boolean(currentUser);

    ["loginBtn", "joinBtn", "bannerJoinBtn"].forEach(id => {
      if ($(id)) $(id).hidden = signedIn;
    });

    $("profileBtn").hidden = !signedIn;
    $("mobileLoginBtn").innerHTML = signedIn
      ? "♙<span>Profile</span>"
      : "♙<span>Account</span>";

    if (signedIn) fillProfile();
  }

  function requireLogin(action) {
    if (!currentUser) {
      notice("Join FFineXX", `Log in or create an account to ${action}.`);
      openAccount("signup");
      return false;
    }
    return true;
  }

  $("closeAccountDialog").addEventListener("click", closeAccount);
  $("closeNoticeDialog").addEventListener("click", () => noticeDialog.close());
  $("dialogOkay").addEventListener("click", () => noticeDialog.close());

  $("showSignup").addEventListener("click", () => setMode("signup"));
  $("showLogin").addEventListener("click", () => setMode("login"));
  $("loginBtn").addEventListener("click", () => openAccount("login"));
  $("joinBtn").addEventListener("click", () => openAccount("signup"));
  $("bannerJoinBtn").addEventListener("click", () => openAccount("signup"));
  $("profileBtn").addEventListener("click", showProfile);
  $("mobileLoginBtn").addEventListener("click", showProfile);
  $("createBtn").addEventListener("click", () => {
    if (requireLogin("post videos")) openAccount("studio");
  });

  $("signupForm").addEventListener("submit", async event => {
    event.preventDefault();

    const displayName = $("signupName").value.trim();
    const username = $("signupUsername").value.trim().toLowerCase();
    const country = $("signupCountry").value;
    const phone = $("signupPhone").value.trim();
    const email = $("signupEmail").value.trim();
    const password = $("signupPassword").value;

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      status("Username must be 3–24 characters: letters, numbers and underscores.", true);
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
        status("Check your email for the confirmation link, then log in.");
      }
    } catch (err) {
      status(err.message || "Signup failed.", true);
    } finally {
      button.disabled = false;
      button.textContent = "Create account";
    }
  });

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

  $("googleSignInBtn").addEventListener("click", async () => {
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) status(error.message, true);
  });

  $("profileSettingsBtn").addEventListener("click", () => setMode("settings"));
  $("dashboardBtn").addEventListener("click", () => setMode("dashboard"));
  $("studioBtn").addEventListener("click", () => setMode("studio"));
  $("backToProfileBtn").addEventListener("click", () => setMode("profile"));
  $("backFromDashboardBtn").addEventListener("click", () => setMode("profile"));
  $("backFromStudioBtn").addEventListener("click", () => setMode("profile"));

  $("profileEditForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!currentUser) return;

    const display_name = $("editDisplayName").value.trim();
    const username = $("editUsername").value.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      notice("Invalid username", "Use 3–24 letters, numbers or underscores.");
      return;
    }

    try {
      const { data, error } = await client.auth.updateUser({
        data: { ...currentUser.user_metadata, display_name, username }
      });
      if (error) throw error;
      updateUI(data.user);
      notice("Profile updated", "Your profile information was saved.");
      setMode("profile");
    } catch (err) {
      notice("Could not save", err.message);
    }
  });

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

  $("studioUploadBtn").addEventListener("click", () => {
    notice(
      "Video publishing",
      "The upload screen will be enabled after secure video storage and the publishing database are connected."
    );
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;

      if (["Upload", "Studio", "Dashboard", "Settings"].includes(view) &&
          !requireLogin("use creator tools")) return;

      const titles = {
        "For You": ["Discover your next favourite.", "Watch public videos without an account."],
        Following: ["Following", "Sign in to follow creators."],
        Explore: ["Explore FFineXX", "Discover creators, music and stories."],
        Upload: ["Create a video", "Video publishing needs connected storage."],
        Dashboard: ["Creator dashboard", "Review your creator activity."],
        Studio: ["Creator Studio", "Manage your creative workflow."],
        Settings: ["Account settings", "Manage your profile."]
      };

      const details = titles[view] || [view, "Discover FFineXX."];
      $("pageTitle").textContent = details[0];
      $("pageSubtitle").textContent = details[1];

      document.querySelectorAll("[data-view]").forEach(item => {
        item.classList.toggle("active", item.dataset.view === view);
      });

      if (view === "Upload") openAccount("studio");
      if (view === "Studio") openAccount("studio");
      if (view === "Dashboard") openAccount("dashboard");
      if (view === "Settings") openAccount("settings");
    });
  });

  document.querySelectorAll("[data-feed]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-feed]").forEach(item =>
        item.classList.toggle("active", item === button)
      );
      if (button.dataset.feed !== "For You") {
        notice(button.dataset.feed, "Personalized video feeds will be connected to real video data.");
      }
    });
  });

  document.querySelectorAll('[data-action="like"], [data-action="favorite"], [data-action="share"]').forEach(button => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;

      if (!requireLogin(action === "favorite" ? "save favourites" : action + " videos")) {
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
            notice("Link copied", "Share this FFineXX link with your friends.");
          }
        } catch (err) {
          if (err.name !== "AbortError") notice("Share FFineXX", window.location.href);
        }
      } else {
        notice(
          action === "like" ? "Like" : "Favourite",
          "Your account is ready. Persistent likes and favourites will work after video database tables are connected."
        );
      }
    });
  });

  $("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const q = $("searchInput").value.trim();
      notice("Search FFineXX", q
        ? `Search for "${q}" will be connected to creator and video data.`
        : "Type a creator or topic to search.");
    }
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error(error.message);
      return;
    }
    updateUI(data.session?.user || null);
  });

  client.auth.onAuthStateChange((_event, session) => {
    updateUI(session?.user || null);
  });
});
