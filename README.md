# Safelink - Client-Side Safe Link Generator & Protector

A clean, modern, flat pastel Safelink tool with 100% client-side AES encryption, countdown delay safeguard, optional password protection, and responsive dummy ad placements.

Built by **Robbi Rizaldi** ([robbirizaldi.my.id](https://robbirizaldi.my.id)).

---

## Features

- **100% Client-Side AES Encryption**: Powered by CryptoJS AES. No backend server or database required.
- **Optional Password Locking**: Secure private URLs with custom passwords. Recipients must input the matching password to unlock the destination.
- **8-Second Countdown Timer**: Automatic verification delay before revealing the target URL.
- **Flat Pastel UI Design**: Clean, minimal pastel aesthetic with subtle borders and zero futuristic gradients.
- **Dummy Ad Slots**: Ready-to-use responsive ad placeholders (728x90 leaderboard and 300x250 rectangle), ready for Google AdSense or other ad networks.
- **Two-Page Architecture**:
  - `index.html`: Generator page to create and copy safe links.
  - `go.html`: Portal/reader page where visitors wait for the countdown and unlock the destination.

---

## File Structure

```text
safelink/
├── index.html                  # Generator page
├── go.html                     # Visitor countdown & unlock portal
├── PANDUAN-AUTO-SAFELINK.txt   # Complete guide & script for Auto Safelink on Blogger/WordPress
├── README.md                   # Documentation & GitHub export guide
└── assets/
    ├── css/safelink.css
    ├── js/cryptojs-aes.min.js
    └── js/safelink.js
```

---

## How to Convert / Export to a Standalone GitHub Repository

If you want to publish this tool as its own independent GitHub repository:

1. Create a new folder on your computer (e.g. `safelink-app`).
2. Copy `index.html`, `go.html`, and `README.md` into the new folder.
3. Copy the `assets/` subfolder containing the CSS and JS files:
   - `assets/css/safelink.css`
   - `assets/js/cryptojs-aes.min.js`
   - `assets/js/safelink.js`
4. In `index.html` and `go.html`, update the asset paths to relative paths:
   - `../../assets/css/tools/safelink.css` → `assets/css/safelink.css`
   - `../../assets/js/tools/...` → `assets/js/...`
5. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Safelink standalone"
   git remote add origin https://github.com/yourusername/safelink.git
   git push -u origin main
   ```
6. Deploy directly to GitHub Pages, Vercel, Netlify, or Cloudflare Pages for free!

---

## Customization

### Change Countdown Duration
Open `assets/js/safelink.js` and edit:
```javascript
const CONFIG = {
  defaultCountdown: 8, // Change this value to your preferred seconds
  ...
};
```

### Insert Real Google AdSense Ads
Replace the `.dummy-ad` blocks in `index.html` and `go.html` with your actual AdSense snippet:
```html
<ins class="adsbygoogle"
     style="display:inline-block;width:728px;height:90px"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

---

## License
MIT License.

