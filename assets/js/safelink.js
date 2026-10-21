/**
 * Safelink Tool - Engine (Standalone, 100% Client-Side)
 * Handles AES encryption, password locking, countdown timer, and decryption.
 * Author: Robbi Rizaldi
 */

(function () {
  "use strict";

  const CONFIG = {
    defaultCountdown: 8, // 8-second countdown as requested
    appSalt: "rr_safelink_2026_salt",
    toastDuration: 2500,
  };

  function showToast(message) {
    let toast = document.getElementById("safelink-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "safelink-toast";
      toast.className = "safelink-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("active");
    setTimeout(function () {
      toast.classList.remove("active");
    }, CONFIG.toastDuration);
  }

  /* -------------------------------------------------------------
     GENERATOR LOGIC (index.html)
     ------------------------------------------------------------- */
  function initGenerator() {
    const inputUrl = document.getElementById("original-url");
    const inputPass = document.getElementById("link-password");
    const btnToggleLock = document.getElementById("btn-toggle-lock");
    const passwordBox = document.getElementById("password-box");
    const btnGenerate = document.getElementById("btn-generate");
    const resultBox = document.getElementById("result-box");
    const resultUrl = document.getElementById("result-url");
    const btnCopy = document.getElementById("btn-copy");
    const btnTest = document.getElementById("btn-test");

    if (!btnGenerate) return;

    if (btnToggleLock && passwordBox) {
      btnToggleLock.addEventListener("click", function () {
        passwordBox.classList.toggle("active");
        if (passwordBox.classList.contains("active")) {
          btnToggleLock.textContent = "REMOVE PASSWORD";
          inputPass.focus();
        } else {
          btnToggleLock.textContent = "LOCK WITH PASSWORD";
          inputPass.value = "";
        }
      });
    }

    btnGenerate.addEventListener("click", function (e) {
      e.preventDefault();
      let rawUrl = (inputUrl.value || "").trim();
      if (!rawUrl) {
        alert("Please enter a valid URL.");
        inputUrl.focus();
        return;
      }

      // Prepend https:// if protocol is missing
      if (!/^https?:\/\//i.test(rawUrl)) {
        rawUrl = "https://" + rawUrl;
        inputUrl.value = rawUrl;
      }

      const pass = (inputPass.value || "").trim();
      const hasPassword = pass.length > 0;

      const payload = JSON.stringify({
        u: rawUrl,
        p: hasPassword ? 1 : 0,
        t: Date.now(),
      });

      // Encrypt with user's password if provided, or with standard appSalt
      const key = hasPassword ? pass : CONFIG.appSalt;
      const ciphertext = CryptoJS.AES.encrypt(payload, key).toString();

      // Build destination URL (go.html)
      const currentDir = window.location.href.split(/[?#]/)[0].replace(/index\.html$/i, "").replace(/\/$/, "");
      let destinationUrl = currentDir + "/go.html?link=" + encodeURIComponent(ciphertext);
      if (hasPassword) {
        destinationUrl += "&protected=1";
      }

      resultUrl.value = destinationUrl;
      if (btnTest) btnTest.href = destinationUrl;
      resultBox.classList.add("active");
      resultUrl.scrollIntoView({ behavior: "smooth", block: "nearest" });

      if (typeof gtag === "function") {
        gtag("event", "safelink_generated", {
          has_password: hasPassword ? 1 : 0,
        });
      }
    });

    if (btnCopy) {
      btnCopy.addEventListener("click", function () {
        if (!resultUrl.value) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(resultUrl.value).then(function () {
            showToast("Safe link copied to clipboard!");
          });
        } else {
          resultUrl.select();
          document.execCommand("copy");
          showToast("Safe link copied to clipboard!");
        }
      });
    }
  }

  /* -------------------------------------------------------------
     READER / COUNTDOWN LOGIC (go.html)
     ------------------------------------------------------------- */
  function initReader() {
    const timerContainer = document.getElementById("timer-container");
    const timerCount = document.getElementById("timer-count");
    const unlockBox = document.getElementById("unlock-box");
    const unlockPass = document.getElementById("unlock-password");
    const btnUnlock = document.getElementById("btn-unlock");
    const visitBox = document.getElementById("visit-box");
    const btnVisit = document.getElementById("btn-visit");
    const alertBox = document.getElementById("safelink-alert");

    if (!timerContainer) return;

    function showAlert(msg) {
      if (!alertBox) return;
      alertBox.textContent = msg;
      alertBox.className = "safelink-alert alert-danger";
      alertBox.style.display = "block";
    }

    function hideAlert() {
      if (!alertBox) return;
      alertBox.style.display = "none";
    }

    const params = new URLSearchParams(window.location.search);
    const linkCipher = params.get("link");
    const isProtected = params.get("protected") === "1";

    if (!linkCipher) {
      timerContainer.style.display = "none";
      showAlert("Invalid or missing link parameter. Please generate a valid safe link first.");
      const backLink = document.getElementById("btn-create-link");
      if (backLink) backLink.style.display = "inline-flex";
      return;
    }

    let remaining = CONFIG.defaultCountdown;
    timerCount.textContent = remaining;

    const interval = setInterval(function () {
      remaining -= 1;
      if (remaining > 0) {
        timerCount.textContent = remaining;
      } else {
        clearInterval(interval);
        timerContainer.style.display = "none";

        if (isProtected) {
          // Show password input
          if (unlockBox) {
            unlockBox.style.display = "block";
            unlockPass.focus();
          }
        } else {
          // Decrypt automatically using appSalt
          try {
            const bytes = CryptoJS.AES.decrypt(linkCipher, CONFIG.appSalt);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            const data = JSON.parse(decryptedText);
            if (data && data.u) {
              revealDestination(data.u);
            } else {
              showAlert("Unable to decode link. The link might be invalid or corrupted.");
            }
          } catch (e) {
            showAlert("Unable to decode link. The link might be invalid or corrupted.");
          }
        }
      }
    }, 1000);

    function revealDestination(targetUrl) {
      hideAlert();
      if (unlockBox) unlockBox.style.display = "none";
      if (visitBox) visitBox.style.display = "block";
      if (btnVisit) {
        btnVisit.href = targetUrl;
        btnVisit.onclick = function () {
          if (typeof gtag === "function") {
            try {
              gtag("event", "safelink_visit_destination", {
                destination_domain: new URL(targetUrl).hostname,
              });
            } catch (_) {
              gtag("event", "safelink_visit_destination");
            }
          }
        };
      }
    }

    if (btnUnlock) {
      btnUnlock.addEventListener("click", function (e) {
        e.preventDefault();
        const enteredPass = (unlockPass.value || "").trim();
        if (!enteredPass) {
          showAlert("Please enter the password to unlock this link.");
          unlockPass.focus();
          return;
        }

        try {
          const bytes = CryptoJS.AES.decrypt(linkCipher, enteredPass);
          const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedText) {
            showAlert("Incorrect password. Please verify and try again.");
            unlockPass.focus();
            return;
          }
          const data = JSON.parse(decryptedText);
          if (data && data.u) {
            revealDestination(data.u);
          } else {
            showAlert("Incorrect password. Please verify and try again.");
            unlockPass.focus();
          }
        } catch (err) {
          showAlert("Incorrect password. Please verify and try again.");
          unlockPass.focus();
        }
      });

      unlockPass.addEventListener("keyup", function (e) {
        if (e.key === "Enter") {
          btnUnlock.click();
        }
      });
    }
  }

  // Auto-init based on page elements
  document.addEventListener("DOMContentLoaded", function () {
    initGenerator();
    initReader();
  });
})();

