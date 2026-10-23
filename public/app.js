
"use strict";

// FFineXX Supabase connection
const SUPABASE_URL = "https://ogzkrakaypfhowkgvvzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uzizmRLBZehb_4MkQcgqEg_DPQ0pyKl";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener("DOMContentLoaded", () => {
  const noticeDialog = document.getElementById("noticeDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogMessage = document.getElementById("dialogMessage");

  const accountDialog = document.getElementById("accountDialog");
  const accountTitle = document.getElementById("accountTitle");
  const accountDescription = document.getElementById("accountDescription");
  const accountStatus = document.getElementById("accountStatus");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const switchAccountMode = document.getElementById("switchAccountMode");

  let accountMode = "signup";

  function showNotice(title, message) {
    if (!noticeDialog || !dialogTitle || !dialogMessage) {
      window.alert(title + "\n\n" + message);
      return;
    }

    dialogTitle.textContent = title;
    dialogMessage.textContent = message;

    if (typeof noticeDialog.showModal === "function") {
      noticeDialog.showModal();
    } else {
      window.alert(title + "\n\n" + message);
    }
  }

  function closeNotice() {
    if (noticeDialog?.open) noticeDialog.close();
  }

  document.getElementById("closeDialog")?.addEventListener("click", closeNotice);
  document.getElementById("dialogOkay")?.addEventListener("click", closeNotice);

  noticeDialog?.addEventListener("click", (event) => {
    if (event.target === noticeDialog) closeNotice();
  });

  function setAccountStatus(message, isError = false) {
    if (!accountStatus) return;
    accountStatus.textContent = message;
    accountStatus.style.color = isError ? "#ff7b91" : "#d7b5ff";
  }

  function setAccountMode(mode) {
    accountMode = mode;
    const isSignup = mode === "signup";

    if (signupForm) signupForm.hidden = !isSignup;
    if (loginForm) loginForm.hidden = isSignup;

    if (accountTitle) {
      accountTitle.textContent = isSignup ? "Join FFineXX" : "Welcome back";
    }

    if (accountDescription) {
      accountDescription.textContent = isSignup
        ? "Create your account and join the community."
        : "Log in to continue to FFineXX.";
    }

    if (switchAccountMode) {
      switchAccountMode.textContent = isSignup
        ? "Already have an account? Log in"
        : "New to FFineXX? Create an account";
    }

    setAccountStatus("");
  }

  function openAccount(mode = "signup") {
    setAccountMode(mode);

    if (accountDialog?.showModal) {
      if (!accountDialog.open) accountDialog.showModal();
    } else {
      showNotice("FFineXX Account", "Please use a modern browser to access your account.");
    }
  }

  function closeAccount() {
    if (accountDialog?.open) accountDialog.close();
  }

  document.getElementById("closeAccountDialog")
    ?.addEventListener("click", closeAccount);

  accountDialog?.addEventListener("click", (event) => {
    if (event.target === accountDialog) closeAccount();
  });

  switchAccountMode?.addEventListener("click", () => {
    setAccountMode(accountMode === "signup" ? "login" : "signup");
  });

  // Sign up with email and password
  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const username = document.getElementById("signupUsername").value.trim().toLowerCase();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !username || !email || !password) {
      setAccountStatus("Please fill in every field.", true);
      return;
    }

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setAccountStatus(
        "Username must be 3–24 characters using letters, numbers, or underscores.",
        true
      );
      return;
    }

    if (password.length < 8) {
      setAccountStatus("Your password must be at least 8 characters.", true);
      return;
    }

    const submitButton = document.getElementById("signupSubmit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            username
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        setAccountStatus("Account created! You're now signed in.");
      } else {
        setAccountStatus(
          "Account request received. Check your email for a confirmation link before logging in."
        );
      }

      signupForm.reset();
    } catch (error) {
      setAccountStatus(error.message || "Could not create your account. Please try again.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Create account";
      }
    }
  });

  // Log in with email and password
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const submitButton = document.getElementById("loginSubmit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setAccountStatus("You're logged in successfully!");
      loginForm.reset();

      // Refresh the page after login so the current session is recognized.
      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setAccountStatus(error.message || "Login failed. Check your details and try again.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Log in";
      }
    }
  });

  const featureMessages = {
    "For You": ["For You", "Discover videos and creators on FFineXX."],
    "Following": ["Following", "Creator-following feeds will be connected to your account."],
    "Explore": ["Explore FFineXX", "Discover creators, music, trends, and communities."],
    "LIVE": ["FFineXX LIVE", "Live streaming needs a streaming service and server integration."],
    "Messages": ["Messages", "Private messaging will be added with secure accounts."],
    "Notifications": ["Notifications", "Your creator and account notifications will appear here."],
    "Upload": ["Create a video", "Video uploads will be connected to secure storage in a later step."],
    "Studio": ["Creator Studio", "Creator analytics and video management will be built here."],
    "Templates": ["Video templates", "Choose templates and create videos when the editing tools are connected."],
    "Status": ["Status & Highlights", "Temporary posts and profile highlights will be added here."]
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

    const heading = document.getElementById("pageTitle");
    const subtitle = document.getElementById("pageSubtitle");

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
      if (button.id === "mobileLoginBtn") {
        openAccount("login");
      } else {
        setActiveView(button.dataset.view);
      }
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
      showNotice("Comments", "Comments will be connected to user accounts and the database.");
    });
  });

  document.querySelectorAll('[data-action="share"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const shareData = {
        title: "FFineXX",
        text: "Discover creators on FFineXX.",
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if (error.name !== "AbortError") {
            showNotice("Share FFineXX", window.location.href);
          }
        }
      } else if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showNotice("Link copied", "The FFineXX page link was copied.");
        } catch {
          showNotice("Share FFineXX", window.location.href);
        }
      } else {
        showNotice("Share FFineXX", window.location.href);
      }
    });
  });

  document.getElementById("loginBtn")
    ?.addEventListener("click", () => openAccount("login"));

  document.getElementById("joinBtn")
    ?.addEventListener("click", () => openAccount("signup"));

  document.getElementById("bannerJoinBtn")
    ?.addEventListener("click", () => openAccount("signup"));

  document.getElementById("mobileLoginBtn")
    ?.addEventListener("click", () => openAccount("login"));

  document.getElementById("createBtn")
    ?.addEventListener("click", () => setActiveView("Upload"));

  document.getElementById("supportBtn")
    ?.addEventListener("click", () => {
      showNotice("FFineXX Support", "Support requests will be connected to the admin dashboard.");
    });

  const searchInput = document.getElementById("searchInput");

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = searchInput.value.trim();

      if (!query) {
        showNotice("Search FFineXX", "Type a creator or topic to search.");
        return;
      }

      showNotice(
        "Search",
        'Searching for "' + query + '" will work when video and creator search is connected.'
      );
    }
  });

  // If a session already exists, Supabase restores it automatically.
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Could not check FFineXX session:", error.message);
      return;
    }

    if (data.session) {
      console.log("FFineXX session restored.");
    }
  });
});
