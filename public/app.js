const SUPABASE_URL = "https://ogzkrakaypfhowkgvvzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uzizmRLBZehb_4MkQcgqEg_DPQ0pyKl";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("noticeDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogMessage = document.getElementById("dialogMessage");

  function showNotice(title, message) {
    dialogTitle.textContent = title;
    dialogMessage.textContent = message;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      window.alert(title + "\n\n" + message);
    }
  }

  function closeNotice() {
    if (dialog && dialog.open) dialog.close();
  }

  document.getElementById("closeDialog")?.addEventListener("click", closeNotice);
  document.getElementById("dialogOkay")?.addEventListener("click", closeNotice);

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeNotice();
  });

  const featureMessages = {
    "For You": ["For You", "Discover videos and creators on FFineXX."],
    "Following": ["Following", "Sign-in and creator-following features will be connected next."],
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
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });

  document.querySelectorAll("[data-feed]").forEach((button) => {
    button.addEventListener("click", () => {
      const feed = button.dataset.feed;
      setActiveView(feed);

      if (feed !== "For You") {
        showNotice(feed, "This feed will show personalized videos after accounts and video data are connected.");
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
      showNotice("Comments", "Commenting will be connected to user accounts and the database.");
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

  function openSignup() {
    showNotice(
      "Join FFineXX",
      "The signup form will collect your name, username, email, password, country, and birthday when authentication is connected."
    );
  }

  document.getElementById("loginBtn")?.addEventListener("click", () => {
    showNotice("Log in to FFineXX", "Secure login will be connected to the authentication service.");
  });

  document.getElementById("joinBtn")?.addEventListener("click", openSignup);
  document.getElementById("bannerJoinBtn")?.addEventListener("click", openSignup);
  document.getElementById("mobileLoginBtn")?.addEventListener("click", openSignup);
  document.getElementById("createBtn")?.addEventListener("click", () => setActiveView("Upload"));
  document.getElementById("supportBtn")?.addEventListener("click", () => {
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

      showNotice("Search", 'Searching for "' + query + '" will work when video and creator search is connected.');
    }
  });
});
