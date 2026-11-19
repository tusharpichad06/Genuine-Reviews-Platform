Genuine Reviews
Honest opinions. Real experiences.

Genuine Reviews is a community-driven review platform where people can discover and share experiences about products, services, places, food, education, health and wellness, automotive, technology, and other topics.

Table of Contents
1. Project Overview
2. Goals and Core Principles
3. Technology Stack
4. How the Application Works
5. Main Features
6. User Roles and Permissions
7. Pages and Routes
8. Review Lifecycle
9. Business, Proposal and Deal Workflow
10. Admin Panel
11. Supabase and Database
12. Authentication and Profile Privacy
13. Realtime Functionality
14. Project Structure
15. Environment Variables
16. Installation and Local Setup
17. Available Scripts
18. Supabase Setup Checklist
19. Security Notes
20. Community Guidelines
21. Development Notes and Known Considerations
22. Future Improvements
23. Contributing
24. License
Project Overview
Project name: Genuine Reviews
Repository / working project name: gr
Project type: Full-stack web application
Frontend: React + TypeScript
Backend services and database: Supabase
Development setup: Vite-based frontend (the application has been run locally on Vite's default development port, 5173).

Genuine Reviews helps visitors make more informed decisions by reading real experiences shared by other people. Users can publish reviews, rate the subject of a review, interact with community content, save useful reviews, and report content that may violate platform guidelines.

The platform also includes an administration area for managing users, reviews and reports. A business collaboration workflow is part of the product: businesses can create business profiles, send proposals, and work with recipients through deals after a proposal is accepted.

The project combines three main areas:
- Community reviews: publish, discover, read and discuss experiences.
- Trust and moderation: review reporting, moderation statuses, user status controls and role-based administration.
- Business collaboration: business profiles, proposals, accepted proposals and deal workspaces.
Goals and Core Principles
- Make it easier to find first-hand experiences before making a decision.
- Allow honest positive, negative and mixed opinions.
- Do not require reviews to be positive or favourable.
- Support different experiences and perspectives about the same subject.
- Keep community interactions respectful and useful.
- Discourage spam, manipulation, harassment and exposure of private information.
- Give administrators tools to moderate content and manage platform users.
- Keep private user profile information protected through database access rules.
Technology Stack
The following technologies are evidenced by the project code and development history. Exact package versions should be taken from the repository's package.json and lockfile.
Technology	Purpose
HTML	Web document structure rendered by React
CSS	Styling and layout
JavaScript	Browser runtime and JavaScript ecosystem
TypeScript	Typed application logic and React components (.ts / .tsx)
React	Component-based user interface
Vite	Frontend development server and build tooling
React Router DOM	Client-side navigation and route parameters
Tailwind CSS	Utility-first styling through class names
Supabase	Backend platform, authentication, PostgreSQL database, queries and realtime subscriptions
@supabase/supabase-js	Supabase JavaScript client
Lucide React	Interface icons
Sonner	Toast notifications and user feedback
Custom UI components	Reusable controls such as buttons and other interface elements


Important technology details
- Most application pages are React components written in TypeScript.
- JSX/TSX is used to describe the interface.
- The Supabase client is initialized in src/lib/supabase.ts.
- The application reads Supabase configuration from Vite environment variables.
- The project uses react-router-dom for links, navigation and dynamic routes.
- Tailwind utility classes are used extensively for responsive layout and styling.
- Lucide icons are imported from lucide-react.
- Sonner is used for success and error messages in relevant flows.
Version accuracy: This README intentionally does not guess dependency versions. Check package.json, package-lock.json, pnpm-lock.yaml or yarn.lock in the actual repository for exact versions.

How the Application Works
At a high level:
1. The browser loads the React application served by Vite or the production hosting provider.
2. React Router selects the page based on the current URL.
3. The frontend uses the Supabase client to communicate with the Supabase project.
4. Supabase Auth identifies the signed-in user.
5. PostgreSQL stores application records such as profiles, reviews and community interactions.
6. Row Level Security (RLS) policies decide which records a visitor or signed-in user may read or modify.
7. Supabase Realtime can notify subscribed pages when selected database records change.
8. The UI displays loading, empty, success and error states based on the results.
The frontend is not a replacement for database security. Important permissions must be enforced by Supabase RLS policies and, where applicable, trusted database functions.
Main Features
1. Home page and review discovery
The home page introduces the platform and helps visitors discover community content.

Known home page sections include:
- Platform introduction and headline.
- Search input for products, services, places or other subjects.
- Trending reviews / reviews people are reading.
- Latest reviews from the community.
- Top or community-favourite reviews.
- Review category exploration.
- Navigation to the wider review collection.
- Footer links such as About Us, Privacy Policy, Terms & Conditions, Guidelines and Contact Us.
2. Reviews
A review represents a person's experience with a subject.

Review data used by the application includes fields such as:
- Subject name.
- Category.
- Rating.
- Review title.
- Review content.
- Author/user ID.
- Creation and update timestamps.
- Helpful count.
- View, share and comment counts.
- Review status and moderation status.
- Verification-related fields.
The exact required/optional fields and constraints are defined by the live Supabase schema.
3. Review categories
The application supports browsing reviews by category. Categories visible in the project include:
- Products
- Services
- Places
- Food & Restaurants
- Electronics
- Travel
- Education
- Health & Wellness
- Automotive
- Technology
- Other
The category list may evolve as the product develops.
4. Search
The search experience is intended to help users find reviews by subject, product, service, place or other relevant terms. The exact search fields, ranking and filtering behaviour should be confirmed against the current search page implementation.
5. Review details
The review detail experience provides the full review and community interaction area.

Features evidenced in the implementation include:
- Review content and rating.
- Author information.
- Helpful action and helpful count.
- Comment action and comment count.
- Share action using the Web Share API when available, with a copy-link fallback.
- Review owner actions such as edit and delete.
- Report review flow.
- Review attachments, where present.
- Comment threads and replies.
- Comment likes.
- Saved-review action from review cards or menus, where available.
6. Comments and replies
The comment system supports:
- Comments on reviews.
- Replies linked to a parent comment.
- Nested reply presentation.
- Comment like records.
- Signed-in user identity.
- Visitor identity for supported guest interactions.
The database implementation includes a comment-like relation and uses a visitor identifier for guest-like interactions. Confirm the exact guest permissions and rate-limiting rules in the current database policies before production use.
7. Helpful votes
Users can mark a review as helpful. The interface displays the helpful count and the current interaction state where supported. Helpful voting is intended to reflect genuine usefulness, not to manipulate review visibility or ratings.
8. Save reviews
Signed-in users can save reviews for later. The project uses a saved_reviews relation containing a user reference and a review reference.
9. Share reviews
Review links can be shared using the browser's native share capability when available. If native sharing is unavailable, the application can copy the review URL to the clipboard.
10. Report reviews
Users can report reviews they believe violate community guidelines.

Known behaviour includes:
- A report is associated with the review and reporting user.
- A reason is selected before submission.
- Users cannot report their own review through the implemented review-detail flow.
- Administrators can review submitted reports and manage their status.
11. User profiles
Profiles contain user-facing information such as:
- Username.
- Avatar URL.
- Bio.
- Location.
- Contact email and phone fields, where configured.
- Created and updated timestamps.
- Role.
- Account status.
The profile experience can show the user's own reviews and profile statistics. Saved reviews are available through a separate profile-related page/section.

Privacy requirement: normal users should only be able to read their own private profile record. Administrators can read all profile records. Public business profiles are a separate concept and should not make personal user profiles public.
12. Notifications
The application includes a notification interface in the navigation area.

Known notification UI behaviour includes:
- Notification list.
- Unread/read state.
- Mark all as read.
- Relative notification time.
- Clicking a notification to open the relevant content or destination.
The notifications table is used by the application. Notification types and database constraints must remain aligned with the events generated by the frontend and database.
13. Community guidelines
The Guidelines page explains acceptable platform behaviour.

The documented principles include:
1. Users may share positive, negative or mixed opinions.
2. Rating choice belongs to the reviewer.
3. Different experiences are welcome.
4. Reviews should be based on the reviewer's own experience.
5. Reviews help others discover information.
6. Respect different opinions.
7. Helpful votes should not be manipulated.
8. Avoid spam and repeated unwanted content.
9. Do not expose private or sensitive personal information.
10. Do not use the platform for harassment or abusive behaviour.
11. Do not use reviews primarily for advertising or spam.
12. Report content for genuine guideline concerns, not simply because of disagreement.
13. Content and accounts may be moderated when necessary.
14. Business profiles
The business collaboration area is designed to let a business create and maintain a business profile.

Known planned routes include:
- Business directory.
- Business profile details.
- Create business profile.
- Edit business profile.
A business profile is distinct from a personal user profile. Business profile visibility can be public without making a user's personal profile public.
15. Proposals
The proposal workflow allows a business to send a collaboration proposal to an eligible recipient.

The documented proposal flow includes:
- Proposal sender and recipient.
- Proposal details and attachments.
- Participant-only access to proposal details.
- Sender ability to withdraw a pending proposal.
- Recipient ability to accept or decline a pending proposal.
- Proposal status tracking.
- Creation of a deal after acceptance.
The recipient should only be able to access the proposal if they are a participant. A sender should not be able to accept their own proposal.
16. Deals and deal workspace
A deal represents a collaboration created after a proposal is accepted.

The documented workflow is:
Business creates a business profile
              |
              v
Business sends a proposal
              |
              v
Recipient receives the proposal
              |
              v
Recipient accepts the proposal
              |
              v
Proposal status becomes Accepted
              |
              v
System creates a deal
              |
              v
Both participants access the deal workspace
The deal list is intended to show the user's own collaborations, not unrelated users' or businesses' deals.

Known deal concepts include:
- Active deals.
- Completed deals.
- Cancelled deals.
- Deal details/workspace.
- Other participant information.
- Deal messages or communication.
- Deal attachments and file access.
- Available payment/deal information.
- Cancellation where allowed by the deal's status and rules.
A deal should be created by the accepted-proposal workflow, not by an unrelated manual “create deal” action.
Business/proposal/deal requirements have been documented in project planning material. Verify each page and action in the current source before describing it as production-complete.

User Roles and Permissions
The project uses a role field in the profiles table. Roles evidenced in project data include user and admin. Business capabilities are associated with business profiles and proposal/deal participation; do not assume that a separate business auth role exists unless it is present in the live schema.
Capability	Visitor	Normal user	Admin	Eligible business participant
Browse permitted reviews	Yes	Yes	Yes	Yes
Create a review	No	Yes	As allowed by product rules	As allowed by product rules
Edit own review	No	Yes	Admin moderation tools	As allowed by ownership
Delete own review	No	Yes	Admin moderation tools	As allowed by ownership
Report another user's review	No	Yes	Admin tools	Yes, if signed in
Save a review	No	Yes	Yes, if enabled	Yes, if enabled
View own private profile	No	Yes	Yes	Yes
View another private user profile	No	No	Yes	No, unless explicitly authorised
Manage all users	No	No	Yes	No
Manage review reports	No	No	Yes	No
Access a proposal	No	Participant only	According to admin policy	Participant only
Access a deal	No	Participant only	According to admin policy	Participant only


This table describes the intended permission model. The actual security boundary must be implemented in RLS policies, not only by hiding buttons or routes.
Account status
The profiles table includes a status field. Values evidenced in project data include Active and Suspended.

The project requirement is that reviews authored by suspended users should not be visible to ordinary visitors/users. Administrators may need access for moderation. Make sure all applicable reviews SELECT policies enforce the same rule: PostgreSQL permissive policies are combined with OR, so one broad policy can accidentally bypass a restrictive-looking policy.
Pages and Routes
The following routes have appeared in the application or project planning. The route list is a documentation map, not a guarantee that every page is currently complete.
Core community routes
Route	Purpose
/	Home page and review discovery
/reviews	Review listing / all reviews, if enabled in current router
/review/:id	Review details
/write-review	Create a review
/write-review?edit=:id	Edit an existing review
/search	Search results
/categories	Browse categories
/categories/:category	Reviews for a selected category
/guidelines	Community guidelines
/profile	Signed-in user's profile
/profile/saved-reviews	Saved reviews
/profile/:username	Profile route with a username parameter; access must follow profile privacy rules


Admin routes
Route	Purpose
/admin	Admin dashboard
/admin/users	User management
/admin/reviews	Review moderation
/admin/reports	Review report management


Business collaboration routes
These routes were defined in project planning:
Route	Purpose
/businesses	Business directory
/business/:businessId	Business profile
/business/create	Create a business profile
/business/edit	Edit a business profile
/proposals	Proposal list
/proposals/:proposalId	Proposal details
/deals	Deal list
/deals/:dealId	Deal details and workspace


Check App.tsx for the actual route configuration before relying on a route in production.
Review Lifecycle
A typical review lifecycle is:
User signs in
     |
     v
Opens Write a Review
     |
     v
Enters subject, category, rating and review content
     |
     v
Submits review
     |
     v
Review is stored in Supabase
     |
     v
Review status / moderation rules apply
     |
     v
Permitted users discover and read the review
     |
     +------> Helpful vote
     |
     +------> Comment / reply
     |
     +------> Save review
     |
     +------> Share review
     |
     +------> Report review
The project contains both status and moderation_status fields in review-related code. Their exact relationship and allowed values should be documented from the current database constraints and moderation implementation.
Business, Proposal and Deal Workflow
Business profile lifecycle
Create business profile
        |
        v
Business profile becomes available
        |
        v
Business can use eligible business features
        |
        v
Business sends proposal
The planning material for the current version does not require a business verification badge or a mandatory business verification step. Verification can be considered as a future trust feature.
Proposal lifecycle
Typical statuses described by the project include:
- Pending
- Accepted
- Declined
- Withdrawn
Expected actions:
- Sender: withdraw a pending proposal.
- Recipient: accept or decline a pending proposal.
- Other users: cannot access proposal details unless they are authorised participants.
Deal lifecycle
Typical deal statuses described by the project include:
- Active
- Completed
- Cancelled
An accepted proposal should create the deal and make it visible to both participants. Deal access should be limited to the participants and any explicitly authorised administrator workflow.
Admin Panel
The admin area is intended to centralise platform management.

Known dashboard metrics include:
- Total reviews.
- Pending reviews.
- Approved reviews.
- Rejected reviews.
- Total reports.
- Pending reports.
- Resolved reports.
- Dismissed reports.
- Total users.
Admin functionality documented or evidenced in the project includes:
- View dashboard statistics.
- View and manage users.
- Search users by name, username or email where available.
- Filter users by role and status.
- Change user roles.
- Change user account status.
- View review records.
- Moderate review status.
- Review submitted reports.
- Access profiles for administrative review, subject to the admin-only profile access rule.
Some dashboard statistics use Supabase Realtime subscriptions to refresh when reviews, reports or profiles change.
Supabase and Database
Supabase is the backend platform used by the application.
Supabase services used
Supabase capability	Project usage
Supabase Auth	Identify signed-in users
PostgreSQL Database	Store profiles, reviews and related application data
Row Level Security (RLS)	Enforce user, admin and participant permissions
Supabase JavaScript client	Query and mutate database records from React
Supabase Realtime	Subscribe to selected database changes
Supabase Storage	File uploads/attachments may use storage-backed URLs; confirm the configured buckets and policies in the live project


Tables evidenced by project code or database discussions
The following table names have appeared in the code or project discussions. This is not a complete schema export; inspect Supabase Table Editor or migrations for exact columns, foreign keys, indexes, constraints and triggers.
Table	Known purpose / fields
profiles	User profile data; known fields include id, username, role, status, avatar_url, bio, location, contact fields and timestamps
reviews	Review content; known fields include id, user_id, subject, category, rating, title, content, created_at, status, moderation_status, is_verified, helpful_count, view_count, share_count, comment_count, trust_score, updated_at, verified_at
review_comments	Comments and replies on reviews; known fields include id, review_id, user_id, visitor_id, content, parent_id, created_at, updated_at
review_comment_likes	Likes on comments; known fields include id, comment_id, user_id, visitor_id
saved_reviews	Saved review relation; known fields include user_id and review_id
review_reports	Reports submitted about reviews; known fields include review_id, user_id, reason, and status
notifications	User notifications; known UI fields include notification ID, read state, type and time; a title column was added during a prior schema fix
businesses	Business profile and directory data (business workflow)
proposals	Business collaboration proposals, participants, status and proposal details/attachments
deals	Collaboration records created from accepted proposals
Deal/proposal attachment records	Attachment metadata and file references; confirm the exact table names in the current schema


Important review fields
The review table has used both a general status and a moderation_status. Do not treat them as interchangeable without checking the current implementation.

Known review moderation concepts include:
- Pending
- Approved
- Rejected
- Hidden (used in visibility policy discussions)
Known user account statuses include:
- Active
- Suspended
Exact casing and allowed values must match the actual database constraints and frontend code.
Row Level Security (RLS)
RLS is essential to this project.

The intended profile access rule is:
- Anonymous visitors cannot read private user profile rows.
- An authenticated normal user can read their own profile row.
- An authenticated admin can read all profile rows.
- A normal user cannot read another user's private profile.
- Public business profile access is separate from private personal profile access.
Other important RLS requirements:
- Users can update their own profile only within permitted fields.
- Admins can update user profiles according to admin policy.
- Users can update/delete only their own reviews, subject to moderation and account-status rules.
- Review reports must be associated with the reporting user.
- Proposal details and attachments must be restricted to proposal participants.
- Deal details, messages and attachments must be restricted to deal participants.
- Suspended users' reviews must not be exposed to ordinary users if that is the active product rule.
Avoid recursive RLS policies. A policy on profiles that queries profiles again to determine whether the current user is an admin can cause PostgreSQL error 42P17: infinite recursion detected in policy for relation "profiles". If an admin-check helper function is used, it must be carefully configured as a trusted SECURITY DEFINER function with a safe search_path, restricted execute permissions and an owner that can bypass the relevant RLS policy. Test it using separate normal-user, admin and anonymous sessions.

Also remember that permissive PostgreSQL policies are combined with OR. Adding a restrictive-looking policy does not override an existing broad USING (true) policy.
Authentication and Profile Privacy
Supabase Auth provides the authenticated user identity. Application profile data is associated with the auth user through profiles.id.

The project uses the following identity relationship:
auth.users.id
      |
      | matching user ID
      v
profiles.id
      |
      +---- reviews.user_id
      +---- saved_reviews.user_id
      +---- review_comments.user_id
      +---- review_reports.user_id
The exact foreign-key definitions should be checked in Supabase.

The profile page supports the current user's profile. An administrative profile-viewing flow has also been developed/planned so an admin can inspect another user's profile. That administrative mode should be read-only unless a specific admin action is explicitly provided.

Do not rely only on frontend checks for privacy. Enforce the same access rules with RLS.
Realtime Functionality
Supabase Realtime subscriptions have been used in the admin dashboard to refresh dashboard statistics when records change.

Known subscription targets include:
- reviews — insert, update and delete events.
- review_reports — database changes.
- profiles — database changes.
The page should remove/unsubscribe from channels when the component unmounts to avoid duplicate subscriptions.

Realtime availability also depends on the relevant tables being enabled for Supabase Realtime and the current project's publication configuration.
Project Structure
The following is a representative structure based on file paths referenced in the project. It is not a verified complete directory listing.
gr/
├── public/
│   └── ...                         # Static public assets
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   └── ...                 # Reusable UI components
│   │   ├── business/
│   │   │   └── ...                 # Business-related components
│   │   └── AdminNavigation.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   └── ...                     # Shared helpers
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Profile.tsx
│   │   ├── ReviewDetails.tsx
│   │   ├── LatestReviews.tsx
│   │   ├── Categories.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsers.tsx
│   │   └── ...                     # Other route pages
│   ├── App.tsx                     # Application routes
│   └── main.tsx                    # React entry point (verify filename)
├── .env                            # Local environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
├── package-lock.json               # Or another package-manager lockfile
├── tsconfig.json
└── vite.config.ts
Important files
File	Responsibility
src/App.tsx	Defines application routes and page composition
src/lib/supabase.ts	Creates and exports the Supabase client
src/hooks/useAuth.ts	Shared authentication state/access hook
src/components/layout/Navbar.tsx	Main navigation, profile entry and notification UI
src/components/layout/Footer.tsx	Shared footer
src/pages/Profile.tsx	User profile and profile-related information
src/pages/ReviewDetails.tsx	Review detail, interaction and comment experience
src/pages/AdminDashboard.tsx	Admin overview and dashboard statistics
src/pages/AdminUsers.tsx	Admin user management


Environment Variables
The Supabase client code referenced in the project uses these Vite environment variables:
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
Create a local .env file in the project root and add the values from:

Supabase Dashboard → Project Settings → API

Do not commit .env to Git.
Environment variable notes
- VITE_SUPABASE_URL is the Supabase project URL.
- VITE_SUPABASE_PUBLISHABLE_KEY is the browser-safe publishable key used by the frontend.
- Never put a Supabase service_role key in a Vite VITE_ variable or expose it in browser code.
- If the current supabase.ts file uses different variable names, follow the source file and update this README accordingly.
Installation and Local Setup
Prerequisites
Install the following before starting:
- Node.js (use a currently supported LTS release).
- npm, or the package manager matching the repository lockfile.
- Git.
- A Supabase project with the required database schema and Auth configuration.
1. Clone the repository
git clone YOUR_REPOSITORY_URL
cd gr
Replace YOUR_REPOSITORY_URL with the actual Git repository URL. If the local folder has another name, use that folder name instead of gr.
2. Install dependencies
For an npm project:
npm install
If the repository uses pnpm-lock.yaml or yarn.lock, use the matching package manager instead.
3. Configure environment variables
Create .env in the root directory:
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
Replace the placeholders with your own Supabase project values.
4. Configure Supabase
Before running the app, make sure the Supabase project contains the tables, columns, foreign keys, storage buckets, Auth settings and RLS policies required by the application.

See Supabase Setup Checklist.
5. Start the development server
The project has been developed with Vite. For the standard Vite npm script:
npm run dev
Open the local URL printed by Vite. The development server commonly uses:
http://localhost:5173
If the command is unavailable, inspect the scripts section of package.json; do not add scripts blindly.
6. Create a production build
If the repository defines the standard Vite build script:
npm run build
To preview the generated production build locally, if the preview script exists:
npm run preview
Available Scripts
The exact scripts are controlled by package.json. The following are common Vite script names; verify that each exists before using it.
Command	Typical purpose
npm run dev	Start local Vite development server
npm run build	Type-check/build the production application, depending on project configuration
npm run preview	Preview the production build locally
npm run lint	Run linting, only if configured


For exact commands, open package.json and inspect its scripts object.
Supabase Setup Checklist
Use this checklist when connecting a fresh Supabase project or reviewing an existing one.
Authentication
- [ ] Enable the authentication providers required by the application.
- [ ] Confirm sign-up and sign-in flows.
- [ ] Configure allowed redirect URLs for local and production environments.
- [ ] Confirm that a profile row is created for each new auth user, if the app relies on that behaviour.
- [ ] Confirm profiles.id maps to the corresponding auth user ID.
Database
- [ ] Create/verify profiles.
- [ ] Create/verify reviews.
- [ ] Create/verify review_comments.
- [ ] Create/verify review_comment_likes.
- [ ] Create/verify saved_reviews.
- [ ] Create/verify review_reports.
- [ ] Create/verify notifications.
- [ ] Create/verify business, proposal and deal tables if those modules are enabled.
- [ ] Verify foreign keys, unique constraints, indexes, defaults and check constraints.
- [ ] Confirm all status values match the frontend.
RLS and permissions
- [ ] Enable RLS on tables containing user or business data.
- [ ] Test anonymous access.
- [ ] Test a normal authenticated user.
- [ ] Test an admin account.
- [ ] Test that normal users cannot read another user's private profile.
- [ ] Test that admins can read all profiles.
- [ ] Test that users cannot modify another user's reviews or profile.
- [ ] Test report ownership and admin moderation permissions.
- [ ] Test proposal participant-only access.
- [ ] Test deal participant-only access.
- [ ] Check for overlapping permissive policies.
- [ ] Check for recursive policy definitions.
Storage
- [ ] Identify the actual buckets used for avatars and attachments.
- [ ] Confirm whether buckets are public or private by design.
- [ ] Configure upload, read and delete policies.
- [ ] Validate file type and file size in the application and backend.
- [ ] Ensure private deal/proposal attachments cannot be accessed by unrelated users.
- [ ] Verify signed URL expiry and download behaviour if private buckets are used.
Realtime
- [ ] Enable Realtime for tables that require subscriptions.
- [ ] Confirm RLS behaviour for subscribed records.
- [ ] Test insert/update/delete events.
- [ ] Confirm subscriptions are removed when pages unmount.
Security Notes
Security must be enforced by Supabase, not only by the React interface.
1. Never expose service-role credentials. Browser code must use only the publishable/anon key intended for client use.
2. Enable RLS on tables containing private user, moderation, proposal, deal or attachment data.
3. Keep profile privacy server-enforced. Hiding a profile link is not access control.
4. Check ownership on writes. A user must not be able to submit another user's ID and modify their records.
5. Restrict admin operations. Admin role checks must be enforced in trusted database policies/functions.
6. Avoid recursive RLS. A policy that queries its own protected table can trigger PostgreSQL 42P17.
7. Review policy composition. Permissive policies combine with OR; a broad USING (true) policy can expose rows despite another policy.
8. Protect attachments. Private collaboration files must be restricted to authorised participants.
9. Validate uploads. Restrict file types, sizes and paths.
10. Do not trust client-supplied role values. Users must not be able to promote themselves to admin.
11. Treat suspended accounts consistently. Apply the intended visibility and write restrictions across every relevant policy.
12. Avoid logging secrets or sensitive user data in browser console output.
Community Guidelines
Genuine Reviews is designed to support honest opinions, not to force positive ratings.
- Positive, negative and mixed experiences are allowed.
- Users should write from their own experience.
- Different people may have different experiences with the same subject.
- Disagreement is not, by itself, a reason to report a review.
- Helpful votes should be genuine.
- Spam, harassment, threats and manipulation are not acceptable.
- Users should not publish private or sensitive personal information.
- Reports should be used for actual guideline concerns.
- Administrators may moderate content or accounts when necessary.
The in-app Guidelines page is the user-facing source for the full community rules.
Development Notes and Known Considerations
- The live source repository and its complete directory listing were not available when this README was prepared. The project structure above is representative, not a guaranteed exact tree.
- Exact package versions, npm scripts, deployment provider, production URL, repository URL, database migrations and complete schema have not been verified. Use the actual project files and Supabase dashboard to fill those details.
- The application has a history of development on a local Vite server at localhost:5173.
- The Supabase client uses VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the referenced project code.
- The database has previously used profile roles user and admin, and account statuses Active and Suspended.
- Review moderation uses status and moderation_status; confirm the current allowed values and intended meaning.
- A previous profile privacy requirement is explicit: normal users should only see their own private profile; admins can view all profiles. Do not reintroduce a public SELECT policy on personal profiles.
- Business profiles are separate from personal user profiles and may have different visibility rules.
- Business/proposal/deal pages have detailed product requirements in project planning material. Verify implementation status before treating every planned action as complete.
- Do not commit real .env values, API secrets, private storage URLs or user data to this repository.
Future Improvements
Potential areas to consider as the project matures:
- Add automated tests for authentication, role checks and RLS behaviour.
- Add integration tests for review creation, moderation, reports and comments.
- Add a documented database migration history.
- Add clear file upload limits and attachment security tests.
- Add abuse prevention and rate limiting for public interactions.
- Add monitoring and structured error reporting.
- Document deployment and environment setup for staging and production.
- Add accessibility checks for forms, dialogs, navigation and keyboard usage.
- Add a complete API/database schema reference generated from migrations.
- Add business verification only if it becomes a product requirement.
Contributing
Contributions should preserve existing product behaviour and security requirements.

Suggested workflow:
1. Create a branch for the change.
2. Keep changes focused and avoid unrelated refactoring.
3. Follow existing React and TypeScript patterns.
4. Reuse existing UI components and shared helpers.
5. Never hardcode credentials or secrets.
6. Review database/RLS implications for any Supabase change.
7. Test as a visitor, normal user and admin where relevant.
8. Test responsive layouts and loading/error/empty states.
9. Update this README when routes, features, environment variables or database schema change.
10. Submit a pull request with a clear summary and test notes.
License
No verified license file or licensing terms were available when this README was prepared. Add the project's chosen license before distributing or reusing the code publicly.
Maintainer Checklist Before Publishing This README
Update these placeholders and verify these facts against the actual repository:
- [ ] Git repository URL.
- [ ] Production website URL.
- [ ] Exact package versions and package manager.
- [ ] Exact package.json scripts.
- [ ] Actual full source folder tree.
- [ ] Actual routes in src/App.tsx.
- [ ] Complete Supabase table/column/foreign-key schema.
- [ ] All Storage bucket names and access policies.
- [ ] Auth providers and redirect URLs.
- [ ] Deployment provider and deployment steps.
- [ ] License.
- [ ] Which business, proposal and deal features are implemented versus planned.
Documentation principle: this README separates features evidenced by the project history from planned workflows and configuration that still need verification. Keep that distinction when updating it so a new developer is not misled about what is already live.














# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```








Free Domain taked from = https://open-domains.com/

https://genuinereviews.is-local.org/





to update code of vs code to github:
#these are terminal commands-
git add .github/workflows/deploy.yml
git commit -m "Verify Supabase URL configuration"
git pull --rebase origin main
git push origin main