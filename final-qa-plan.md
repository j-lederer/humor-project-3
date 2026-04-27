# Week 13 Final Integration & QA Plan

## Submission URLs

- Project 1, caption creation and rating app: https://humor-project-hw5-72qmmb0rj-j-lederers-projects.vercel.app
- Project 2, admin area app: https://humor-project-2-5gnw4kuhn-j-lederers-projects.vercel.app
- Project 3, prompt chain tool app: https://humor-project-3-ey7hoqt9o-j-lederers-projects.vercel.app

## System Overview

The full system has three applications connected through the same Supabase data model and caption generation pipeline.

- Project 1 lets users sign in, upload images, generate AI captions, browse captions, and rate captions with upvotes or downvotes.
- Project 2 gives admins read and management views over users, images, captions, caption requests, prompt chain records, and supporting configuration tables.
- Project 3 lets authorized admins manage humor flavors, edit prompt-chain steps, test flavor output, view caption statistics, and duplicate a flavor with its related steps.

## Project 1 Test Tree: Caption Creation and Rating

1. Landing page
   - Visit `/` while signed out.
   - Verify the app explains image upload, caption generation, and rating.
   - Verify Google sign-in is available.
   - Verify Upload and Captions actions do not expose protected content while signed out.

2. Authentication
   - Click Sign in with Google.
   - Complete OAuth callback.
   - Verify the signed-in state appears on the landing page.
   - Verify sign-out clears the session and returns the app to public state.

3. Upload and generation
   - Navigate to `/upload` while signed in.
   - Select a supported image type: JPEG, PNG, WebP, GIF, or HEIC.
   - Verify local preview appears.
   - Verify unsupported file types are rejected with a clear error.
   - Submit the image.
   - Verify upload status changes while work is running.
   - Verify the API registers the image and returns generated captions.
   - Verify generated captions render under the image preview.
   - Repeat with three different images to catch intermittent pipeline failures.

4. Caption browsing
   - Navigate to `/captions` while signed in.
   - Verify captions load from Supabase.
   - Verify each caption shows upvote and downvote counts.
   - Use sorting options: newest, oldest, most liked, and least liked.
   - Use pagination next and previous controls.
   - Verify empty and error states do not break layout.

5. Rating
   - Upvote a caption.
   - Verify the local count increments and "You voted" feedback appears.
   - Downvote another caption.
   - Verify the local count increments and feedback appears.
   - Try voting on an already-rated caption and verify duplicate voting is blocked by the UI.
   - Verify the new vote appears in Supabase `caption_votes`.

6. Security and error branches
   - Visit `/upload` while signed out and verify redirect to `/`.
   - Visit `/captions` while signed out and verify redirect to `/`.
   - POST to `/api/generate-captions` while signed out and verify `401 Unauthorized`.
   - Test a malformed API request and verify it fails safely.

## Project 2 Test Tree: Admin Area

1. Landing and access control
   - Visit `/` while signed out.
   - Verify the admin landing page loads.
   - Visit `/dashboard` while signed out and verify redirect to `/`.
   - Sign in as a non-admin user and verify access denied state.
   - Sign in as a superadmin or matrix admin and verify dashboard access.

2. Dashboard overview
   - Verify total users, images, captions, and votes load.
   - Verify recent images render with links.
   - Verify top-voted captions render with vote scores.
   - Verify vote distribution shows upvotes and downvotes.

3. Data table pages
   - Visit Users, Images, Captions, Caption Requests, Caption Examples, Terms, Allowed Signup Domains, Whitelist Emails, LLM Providers, LLM Models, LLM Model Responses, Prompt Chains, Humor Flavors, Flavor Steps, and Flavor Mix.
   - Verify each page loads without a server error.
   - Verify counts and empty states render.
   - Verify read-only tables do not expose edit controls.

4. Admin mutations
   - Add, edit, and delete a caption example.
   - Add, edit, and delete a term.
   - Add, edit, and delete an allowed signup domain.
   - Upload an image through admin image controls.
   - Edit an existing image URL.
   - Delete a test image.
   - Update a humor flavor mix record.
   - Verify all mutations record the current user in audit fields when applicable.

5. Error branches
   - Test create forms with required fields missing.
   - Test invalid numeric input in editable tables.
   - Test storage upload failure by using an invalid file.
   - Verify errors are visible and do not leave the UI stuck loading.

## Project 3 Test Tree: Prompt Chain Tool

1. Landing and access control
   - Visit `/` while signed out.
   - Verify the Prompt Chain Tool landing page loads.
   - Visit `/dashboard` while signed out and verify redirect to `/`.
   - Sign in as a non-admin user and verify access denied state.
   - Sign in as a superadmin or matrix admin and verify dashboard access.

2. Dashboard statistics
   - Verify humor flavor, step, caption, and rated-caption counts load.
   - Verify total ratings, upvotes, downvotes, and study ratings load from `caption_votes`.
   - Verify top-rated captions table loads.
   - Verify recent ratings table loads.

3. Humor flavor list and creation
   - Visit `/dashboard/flavors`.
   - Verify existing flavors and step counts render.
   - Create a new flavor with a unique name.
   - Verify duplicate or blank names are handled safely.
   - Verify the new flavor appears in the list.

4. Flavor detail and steps
   - Open a flavor detail page.
   - Edit the flavor name and description.
   - Add a new step with model, temperature, system prompt, and user prompt.
   - Edit the step.
   - Move the step up and down.
   - Delete a test step.
   - Verify the page refreshes after each mutation.

5. Flavor duplication
   - Open a flavor with at least one step.
   - Click Duplicate.
   - Enter a new unique flavor name.
   - Verify a new flavor record is created.
   - Verify all related steps are copied to the new flavor in the same order.
   - Try duplicating with an existing name and verify the UI blocks it.
   - Try duplicating with a blank name and verify the UI blocks it.

6. Flavor testing
   - Click Test Flavor.
   - Select an image.
   - Generate captions.
   - Verify generated captions render in the modal.
   - Verify API errors are shown clearly.
   - POST to `/api/test-flavor` while signed out and verify `401`.

## Cross-App Integration Tests

1. Data flow from Project 1 to Project 2
   - Upload an image in Project 1.
   - Generate captions.
   - Open Project 2 Images and verify the image appears.
   - Open Project 2 Captions and verify generated captions appear.
   - Open Project 2 Caption Requests and verify the related request exists.

2. Rating flow from Project 1 to Project 2 and Project 3
   - Rate captions in Project 1.
   - Verify Project 2 dashboard vote totals update.
   - Verify Project 2 Captions page shows updated upvote/downvote counts.
   - Verify Project 3 dashboard rating stats and recent ratings update.

3. Prompt configuration flow from Project 3 to Project 1
   - Create or duplicate a humor flavor in Project 3.
   - Add or edit the flavor steps.
   - Test the flavor in Project 3.
   - Generate captions in Project 1.
   - Verify captions are associated with the expected humor flavor where pipeline settings allow it.

4. Auth and authorization
   - Verify signed-out users cannot access protected routes in all apps.
   - Verify ordinary users can use Project 1 but cannot access Project 2 or Project 3 admin views.
   - Verify admin users can access Project 2 and Project 3.

## Tests Run

I ran the full automated smoke and integration pass 3 times against local dev servers:

- Project 1: `http://localhost:3001`
- Project 2: `http://localhost:3002`
- Project 3: `http://localhost:3000`

Each pass verified:

- Project 1 landing page returns `200`.
- Project 1 `/upload` redirects signed-out users to `/`.
- Project 1 `/captions` redirects signed-out users to `/`.
- Project 1 `/api/generate-captions` returns `401` without auth.
- Project 2 landing page returns `200`.
- Project 2 `/dashboard` redirects signed-out users to `/`.
- Project 3 landing page returns `200`.
- Project 3 `/dashboard` redirects signed-out users to `/`.
- Project 3 `/api/test-flavor` returns `401` without auth.
- Shared Supabase data is reachable and populated: `images`, `captions`, `caption_votes`, `humor_flavors`, and `humor_flavor_steps`.

The three runs all passed. The shared data counts during testing were:

- `images`: 7,949
- `captions`: 96,352
- `caption_votes`: 24,318
- `humor_flavors`: 419
- `humor_flavor_steps`: 905

## Post-Testing Write-Up

- I verified all three apps build successfully with `npm run build`.
- I ran lint checks for all three apps. Project 1 and Project 3 passed; Project 1 has one warning about using `<img>` instead of Next `<Image>`.
- I found that Project 2 had a broken lint script using `next lint`, which is no longer valid in this Next/ESLint setup. I changed the script to `eslint` and added `eslint.config.mjs`.
- After the Project 2 lint fix, Project 2 lint passed with one warning about using `<img>` instead of Next `<Image>`.
- I ran the integration smoke workflow 3 times and verified public pages, protected route redirects, unauthenticated API guards, and shared Supabase connectivity.
- I confirmed the current Vercel projects and deployment-specific submission URLs with the Vercel CLI.
- I confirmed Project 3 has the Week 12 admin rating statistics and flavor duplication features in the current app code.
- Authenticated Google OAuth branches still require a real browser session with an authorized test account, so those branches are listed in the manual QA tree and should be clicked through once with the final submission account before demo.

## Verification Commands

```bash
cd /Users/jonathanlederer/dev/Humor-Project/HW5 && npm run build && npm run lint
cd /Users/jonathanlederer/dev/Humor-Project-2 && npm run build && npm run lint
cd /Users/jonathanlederer/dev/humor-project-3 && npm run build && npm run lint
```
