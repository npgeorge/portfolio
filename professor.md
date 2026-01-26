# The Proof of Nick Portfolio: A Technical Deep Dive

*A story about building a portfolio site, fighting with deployment systems, and learning that sometimes the simplest solution is the best one.*

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Technical Architecture](#technical-architecture)
3. [Codebase Structure](#codebase-structure)
4. [The Technology Stack](#the-technology-stack)
5. [Design Decisions (And Why We Made Them)](#design-decisions-and-why-we-made-them)
6. [The Deployment Saga](#the-deployment-saga)
7. [Bugs, Battles, and Breakthroughs](#bugs-battles-and-breakthroughs)
8. [Lessons for Future You](#lessons-for-future-you)
9. [How Good Engineers Think](#how-good-engineers-think)

---

## The Big Picture

This portfolio site is, at its core, a **static website**. That's a fancy way of saying it's just files—HTML, CSS, JavaScript, and images—sitting on a server, waiting to be downloaded by browsers. No databases. No server-side processing. No PHP or Python running behind the scenes.

Think of it like a digital brochure. When someone visits proofofnick.com, Cloudflare's servers say "here, have these files" and your browser assembles them into what you see.

This simplicity is a **feature, not a limitation**. Static sites are:
- **Fast** (no database queries, no server processing)
- **Secure** (no backend to hack)
- **Cheap** (often free to host)
- **Reliable** (fewer moving parts = fewer things that can break)

For a portfolio showcasing mechanical engineering work, this is perfect. You don't need user accounts, shopping carts, or real-time data. You need beautiful images and compelling text, served fast.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         THE INTERNET                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (DNS + CDN)                       │
│  • Routes proofofnick.com to the right place                    │
│  • Caches files at edge locations worldwide                     │
│  • Provides SSL/HTTPS security                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE PAGES                            │
│  • Hosts the actual files                                       │
│  • Serves them when requested                                   │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │ (deploys on push)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                             │
│  • Watches for changes to the main branch                       │
│  • Automatically deploys to Cloudflare Pages                    │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │ (git push)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR LOCAL MACHINE                          │
│  • Where you write code                                         │
│  • Where you test changes                                       │
└─────────────────────────────────────────────────────────────────┘
```

### The Flow

1. You make changes locally and run `git push`
2. GitHub receives the code and triggers the Action workflow
3. The workflow runs `wrangler pages deploy` with your API token
4. Cloudflare Pages receives the files and deploys them
5. Within seconds, proofofnick.com shows your changes

This is called **CI/CD** (Continuous Integration/Continuous Deployment). The "continuous" part means it happens automatically, every time you push. No manual uploading, no FTP clients, no "did I remember to update the production server?" anxiety.

---

## Codebase Structure

```
portfolio/
├── index.html          # The main page (Profile, Work, Education)
├── resume.html         # Dedicated resume page with password-protected PDF
├── contact.html        # Contact page with email, LinkedIn, GitHub
├── styles.css          # All the visual styling (colors, layout, animations)
├── script.js           # Interactive behavior (carousels, scroll effects)
├── wrangler.json       # Cloudflare Pages configuration
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment workflow
├── images/
│   ├── block/          # Block project images (rig/, bitkey/)
│   ├── apple/          # Apple project images (iphone_13/, iphone_14/)
│   ├── magic_leap/     # Magic Leap images (magic_leap_1/, magic_leap_2/)
│   ├── education/      # School crests
│   └── header/         # Hero section image
└── resume/
    └── NPG_Resume_22.pdf  # The actual resume PDF
```

### How the Files Connect

Think of a webpage like a house:

- **HTML** is the structure—the walls, floors, and rooms. It defines *what* exists.
- **CSS** is the interior design—paint colors, furniture arrangement, decorations. It defines *how things look*.
- **JavaScript** is the smart home system—automatic lights, motorized blinds, the doorbell. It defines *how things behave*.

In `index.html`, you'll see links to the other files:

```html
<link rel="stylesheet" href="styles.css">  <!-- Load the styles -->
<script src="script.js"></script>          <!-- Load the behavior -->
```

The browser reads the HTML first, then fetches CSS and JS as instructed. This is why we put `<script>` at the bottom—let the structure and styles load first, then add interactivity.

### The Separation of Concerns

We started with everything in one file (`main.html` with inline styles and scripts). We split it up because:

1. **Maintainability**: Finding a CSS rule is easier in a dedicated CSS file than hunting through 2000 lines of mixed code
2. **Caching**: Browsers cache files separately. If you change the HTML, visitors don't need to re-download unchanged CSS
3. **Collaboration**: Multiple people can work on different files without merge conflicts
4. **Mental clarity**: It's easier to think about styling when that's ALL the file contains

This is called **separation of concerns**—a fundamental principle in software engineering. Each file has one job.

---

## The Technology Stack

### HTML5
The backbone. We use semantic elements like `<header>`, `<main>`, `<section>`, `<article>`, and `<footer>`. These aren't just `<div>` with fancy names—they tell browsers and screen readers what the content *means*.

### CSS3 (with Custom Properties)
Modern CSS is incredibly powerful. We use:

**CSS Custom Properties (Variables)**
```css
:root {
    --color-accent: #f7931a;  /* Bitcoin orange */
    --font-mono: 'IBM Plex Mono', monospace;
    --chamfer: 12px;
}
```
Change `--color-accent` once, and it updates everywhere. This is how we switched from blue to orange with a single line change.

**Clip-path for Chamfered Corners**
```css
clip-path: polygon(
    var(--chamfer) 0,
    calc(100% - var(--chamfer)) 0,
    100% var(--chamfer),
    /* ... */
);
```
This creates the distinctive cut-corner "blueprint" aesthetic. It's like using a cookie cutter on the element's rectangular shape.

**CSS Grid for the Background**
```css
background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
background-size: var(--grid-size) var(--grid-size);
```
Two sets of lines (horizontal and vertical) create the graph paper effect. No images needed.

### Vanilla JavaScript
No React, no Vue, no jQuery. Just plain JavaScript. Why?

1. **Portfolio sites don't need frameworks**. Frameworks add complexity and bundle size for features we don't use.
2. **Performance**. Less JavaScript = faster load times.
3. **Longevity**. Vanilla JS from 2015 still works. That React app from 2015? Good luck running it without archaeology.

We use:

**Intersection Observer API** for scroll-triggered animations:
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('expanded');
        }
    });
}, { rootMargin: '-20% 0px -60% 0px' });
```

This is like hiring someone to watch a security camera and yell "NOW!" when an element enters view. Much more efficient than checking every millisecond during scroll.

**Event Listeners** for interactivity:
```javascript
document.querySelectorAll('.project-header').forEach(header => {
    header.addEventListener('click', () => {
        header.parentElement.classList.toggle('expanded');
    });
});
```

### Google Fonts
We load IBM Plex Mono (monospace, technical feel) and EB Garamond (serif, elegant headings) from Google's CDN. The `<link rel="preconnect">` tags tell the browser to start the connection early, reducing load time.

### Cloudflare Pages
A static site hosting platform. Free tier includes:
- Unlimited bandwidth
- Global CDN (files served from locations near visitors)
- Automatic HTTPS
- Custom domain support

### GitHub Actions
Automation that runs in GitHub's cloud. Our workflow:
```yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - run: npx wrangler pages deploy . --project-name=portfolio
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Every push to `main` triggers this. It checks out the code and deploys it. The API token is stored as a secret—never in the code.

---

## Design Decisions (And Why We Made Them)

### The Blueprint Aesthetic
This wasn't arbitrary. You're a mechanical engineer. Blueprints are literally your medium. The grid background, chamfered corners, monospace fonts, coordinate markers, datum lines—they all reinforce your professional identity.

Design should *mean* something. It's not just "what looks cool" but "what tells my story."

### Bitcoin Orange (#f7931a)
Started with blue (safe, corporate). Switched to Bitcoin orange because:
1. You work at Block on Bitcoin hardware
2. It's distinctive and memorable
3. It shows personality and conviction

Colors communicate. Orange says "I'm not just another engineer—I'm building the future of money."

### Static Site vs. CMS vs. Framework

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Static HTML/CSS/JS** | Fast, simple, no dependencies | Manual updates | ✅ Perfect for portfolio |
| **CMS (WordPress, etc.)** | Easy editing, plugins | Slow, security issues, overkill | ❌ Too heavy |
| **Framework (React, etc.)** | Component reuse, state management | Build complexity, bundle size | ❌ Unnecessary |

The right tool for the job. A portfolio doesn't need a content management system or a component framework. It needs to load fast and look good.

### Lazy Loading Images
```html
<img loading="lazy" src="images/..." alt="...">
```

One attribute. Massive impact. Images only load when they're about to enter the viewport. This is especially important when you have 40+ high-quality project images.

Before lazy loading: Browser downloads ALL images immediately → slow initial load
After lazy loading: Browser downloads images as needed → fast initial load, smooth scrolling

### Password-Protected Resume
A client-side check—not actually secure. The password is visible in the source code. But it's not *meant* to be Fort Knox. It's a **speed bump**, a signal that says "this is for recruiters, not web scrapers."

For actual security, you'd need server-side authentication. But that adds complexity for marginal benefit.

---

## The Deployment Saga

This deserves its own section because it was... an adventure.

### What We Wanted
Push to GitHub → Site automatically updates. Simple, right?

### What Actually Happened

**Round 1: Cloudflare's New UI**
Cloudflare merged "Workers" and "Pages" into one interface. When we clicked "Create application," we accidentally created a Worker (serverless functions) instead of a Pages project (static hosting). The build kept running `npx wrangler deploy` and failing because there was no Worker code.

*Lesson: New UIs break old documentation. When something doesn't match the tutorial, look for UI changes.*

**Round 2: Build Configuration Hell**
The deploy command field was *required* but we didn't need a build step. We tried `/`, empty strings, various incantations. Internal errors. Configuration not saving.

*Lesson: Sometimes the UI is buggy. Have a backup plan.*

**Round 3: API Token Permissions**
Created a token. Got "Authentication error." Added permissions. Still failed. Added MORE permissions (User Details, Memberships). Finally worked.

The required permissions for Cloudflare Pages deployment:
- Account → Cloudflare Pages: Edit
- Account → Workers Scripts: Edit
- Zone → Zone: Read
- User → Memberships: Read
- User → User Details: Read

*Lesson: API permissions are often trial and error. Start broad, then narrow down.*

**Round 4: The CLI Workaround**
Gave up on the web UI. Deployed directly from terminal:
```bash
npx wrangler pages deploy . --project-name=portfolio
```

It worked immediately. Sometimes the CLI is more reliable than the GUI.

**Round 5: GitHub Actions FTW**
We didn't want manual terminal deploys forever. Created a GitHub Actions workflow that runs the same CLI command automatically on push.

This is a common pattern: when the official integration doesn't work, build your own with the tools that do.

### The Final Solution

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx wrangler pages deploy . --project-name=portfolio
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Twenty lines. Runs on every push. Never fails. Sometimes the "boring" solution is the right one.

---

## Bugs, Battles, and Breakthroughs

### Bug: Images Too Small in Carousel
**Symptom**: Project images were tiny thumbnails instead of prominent showcases.
**Cause**: CSS `max-width` constraints were too aggressive.
**Fix**: Increased `max-height: 50vh` on carousel images, removed restrictive width limits.
**Lesson**: When something looks wrong, check the CSS box model. Width, max-width, height, max-height—they all interact.

### Bug: Projects Left-Aligned on Large Screens
**Symptom**: On wide monitors, content hugged the left side instead of centering.
**Cause**: Legacy `margin-left: 10%` from an earlier asymmetric layout experiment.
**Fix**: Changed to `margin: 0 auto` for true centering.
**Lesson**: Old code lingers. When fixing layout issues, search for ALL instances of margins and positioning.

### Bug: Carousel Arrows Overlapping Images
**Symptom**: Next/Previous buttons appeared on top of photos.
**Cause**: Absolute positioning relative to container, not accounting for padding.
**Fix**: Added `padding: 0 60px` to carousel, positioned arrows within that padding.
**Lesson**: Absolute positioning is relative to the *padding box*. Plan for it.

### Bug: Arrows Moving with Image Height
**Symptom**: Different-sized images caused arrows to jump up and down.
**Cause**: Arrows were centered to the container, but container height varied with content.
**Fix**: Set `min-height: 50vh` on the carousel viewport to lock dimensions.
**Lesson**: Vertical centering with `top: 50%` only works consistently if the container has consistent height.

### Bug: Changes Not Appearing After Deploy
**Symptom**: Deployed successfully, but site showed old version.
**Cause**: Browser caching.
**Fix**: Hard refresh (Cmd+Shift+R) or Cloudflare cache purge.
**Lesson**: "Did you clear your cache?" is the "did you try turning it off and on again?" of web development. Always check.

### Bug: Mobile Nav Bar Crowded
**Symptom**: "N.GEORGE" text overlapping navigation links on iPhone.
**Cause**: Fixed layout not responsive enough for narrow screens.
**Fix**: Hide logo text on mobile (`display: none`), show only the icon (made slightly larger).
**Lesson**: Test on real devices. Simulators lie.

---

## Lessons for Future You

### 1. Start Simple, Add Complexity Only When Needed
We didn't start with the blueprint aesthetic, the circuit decorations, the scroll animations. We started with basic HTML/CSS, got that working, then layered on features.

This is called **iterative development**. Ship something minimal, then improve it. Don't try to build the Sistine Chapel in your first commit.

### 2. Version Control Is Your Time Machine
Git saved us multiple times. When the side-by-side layout experiment failed, we reverted. When deployment broke, we could see exactly what changed.

Commit often. Write meaningful messages. Your future self will thank you.

### 3. The Browser Is Your Debugger
When CSS doesn't work, open DevTools (F12 or Cmd+Option+I). You can:
- See which rules are being applied (and which are overridden)
- Edit CSS live and see changes instantly
- Check the box model (padding, margin, borders)
- Debug JavaScript with breakpoints and console logs

DevTools is the most important skill gap between beginners and professionals.

### 4. Documentation Lies
Cloudflare's docs showed a UI that no longer exists. Tutorials assumed build steps we didn't need. The `wrangler.json` schema had changed.

When something doesn't work:
1. Check if the UI has changed
2. Look at the tool's version and release notes
3. Search for recent forum posts/issues
4. Try the CLI directly

### 5. Security Tokens Are Like Toothbrushes
Don't share them. The API token got exposed in our conversation, so it needed to be regenerated immediately. Store secrets in:
- Environment variables (local development)
- GitHub Secrets (CI/CD)
- Password managers (personal use)

Never commit tokens to git. Never paste them in chat without immediately invalidating them after.

### 6. Performance Matters
We added `loading="lazy"` to images with one line change. That single attribute can cut initial load time by 50%+ on image-heavy pages.

Other quick wins:
- Compress images (TinyPNG, Squoosh)
- Use modern formats (WebP instead of PNG)
- Minimize CSS/JS (Cloudflare can do this automatically)
- Use a CDN (Cloudflare Pages does this for free)

### 7. Mobile First Isn't Just a Buzzword
Most web traffic is mobile. The nav bar bug only appeared on iPhone—we didn't catch it testing on desktop.

Always test responsive breakpoints:
- 320px (small phones)
- 375px (iPhone)
- 768px (tablets)
- 1024px (laptops)
- 1440px+ (desktops)

---

## How Good Engineers Think

### They Understand the "Why"
We didn't just add lazy loading because "it's best practice." We added it because large images were causing slow page loads. The decision came from understanding the problem, not memorizing solutions.

### They Break Problems Down
Deployment failing? Let's isolate:
1. Is it a permissions problem? (Test the token)
2. Is it a configuration problem? (Check wrangler.json)
3. Is it a Cloudflare problem? (Try the CLI directly)
4. Is it a network problem? (Check connection)

Methodical elimination beats frantic googling.

### They Know When to Pivot
The Cloudflare web UI wasn't cooperating. We could have spent hours debugging their systems. Instead, we pivoted to GitHub Actions—a tool that works reliably.

This is engineering judgment: knowing when to push through vs. when to find another path.

### They Document As They Go
This file exists because understanding *why* something works is as valuable as making it work. Six months from now, you won't remember why `margin-left: 10%` was removed. But this document will tell you.

### They Ship, Then Iterate
The site went live before it was "perfect." You can always push another update. A working site today beats a perfect site never.

### They Respect Simplicity
No framework. No build step. No bundler. Just files and a deployment script. The simplest solution that works is usually the right one.

---

## Final Thoughts

This portfolio site is more than a collection of project images. It's a working example of:

- **Clean architecture**: Separation of HTML/CSS/JS
- **Modern CSS**: Custom properties, clip-paths, grid backgrounds
- **Vanilla JavaScript**: No framework overhead, just focused functionality
- **CI/CD**: Automated deployment via GitHub Actions
- **Edge hosting**: Global distribution via Cloudflare
- **Responsive design**: Works on phones to large monitors
- **Performance optimization**: Lazy loading, CDN caching

But more importantly, it tells your story. The blueprint aesthetic isn't just stylish—it communicates "I'm an engineer who thinks in technical drawings." The Bitcoin orange isn't just a color—it shows conviction about the technology you're building.

Good engineering and good design serve the same purpose: solving problems elegantly. This site is proof that you can do both.

Now go build something.

---

*Last updated: January 2026*
*Written while debugging Cloudflare Pages for the 47th time*
