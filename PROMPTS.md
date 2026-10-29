# AI Prompts Used During Development

## Layout and structure

### 1. Starting with the reference design

> I'm recreating this property listing page in React from the reference. Before I start coding, can you help me figure out the main sections and a sensible component structure? I don't want to break everything into tiny components.

### 2. Setting up the main React page

> I have the basic Vite React project ready. Can you help me set up the main page with separate components for the navbar, property details, image gallery, amenities, reviews, booking section and footer? I'd like to keep the structure simple so I can work on each section separately.

### 3. Matching the image gallery

> I want to recreate this gallery from the screenshot. One image needs to be larger and the other images should sit beside it. What's a clean way to do this with CSS Grid? Also, I want to use object-fit: cover without stretching the images.

### 4. Making the gallery reusable

> The image gallery is getting a bit too hardcoded. Can you help me move the photo information into the existing data file and render the gallery from that? I also want to reuse the same photos for the photo tour and viewer.

### 5. Navbar search bar

> I need to build the navbar search pill with the Where, When and Who sections. I also need the menu and language popovers to open and close properly. They should close when I click outside or press Esc, and focus should return to the button after closing. Can you help me structure this cleanly?

### 6. Property details and sections

> Can you help me organize the property details, amenities, reviews and nearby sections so the data stays separate from the UI? I'd prefer the components to mainly handle rendering instead of having lots of hardcoded data inside them.

### 7. Amenities and reviews modals

> I need an "all amenities" modal and a reviews modal. The reviews modal should also be able to open from the URL using `?modal=AMENITIES`. Can we reuse the same dialog behavior that I'm already using for the photo overlays?

## Photo tour and lightbox

### 8. Photo tour and photo viewer

> I want clicking a hero photo or "Show all photos" to open the scrollable photo tour. If I click a particular photo, the tour should scroll to that photo. From the tour, clicking a photo should open the single-photo viewer. I'd like the modal and photo index to be stored in the URL so Back, Forward and refresh work properly. Can we do this with the existing `useModalParams` hook without adding another package?

### 9. Photo tour scroll-spy and viewer controls

> I want the room thumbnails to highlight the room that's currently in view. Can we use IntersectionObserver for that and scroll to the room when its thumbnail is clicked? For the photo viewer, I also need previous/next buttons, left and right arrow keys, Esc to go back to the tour, a filmstrip, a photo counter, fullscreen and touch swipe support.

## Calendar and booking UI

### 10. Calendar implementation

> I'm adding the stay calendar now. It needs to show multiple months, let the user select check-in and checkout, and show unavailable dates differently. Can you help me keep the date calculations separate from the calendar UI?

### 11. Date range logic

> I'm running into some issues with the check-in/check-out logic. I need to stop users from choosing checkout before check-in, prevent blocked dates from being selected and calculate the number of nights correctly. Can you check the current date utility and point out any edge cases I might be missing?

### 12. Guest picker

> I need the guest picker to handle adults, children, infants and pets separately. Adults and children should count toward the property's guest limit, while infants and pets have their own limits. Can you help me keep the increment/decrement logic simple?

### 13. Booking card

> I'm working on the booking card now. It needs to calculate the price from the selected nights, open the date and guest panels, collect the guest details and then submit the booking. Can you help me organize the state so this component doesn't get too messy?

### 14. Closing open panels

> I want the date and guest panels to close when the user clicks outside the booking card or presses Escape. What's a clean way to handle this in React? I'd rather not add a library just for this.

## Frontend and backend connection

### 15. Connecting availability to React

> I already have an availability API on the backend. Can you help me create a small React hook that loads the unavailable dates and makes them available to the calendar? I also need a refresh function so the calendar can update after a booking is made.

### 16. Frontend API layer

> I don't want fetch logic scattered across the components. Can you help me keep the API calls in one place for availability, booking and cancellation? The components should mainly call the API functions and handle the UI state.

## Backend

### 17. Backend structure

> I need a small Node backend for the booking flow. I'd like to keep the HTTP routes separate from the actual booking logic and database access. Can you suggest a clean structure using routes, services, repositories and validation without making it over-engineered?

### 18. Booking API

> I'm working on the booking endpoint. The frontend will send the check-in and checkout dates, guest counts, name and email. What should I validate on the backend instead of just trusting what comes from React?

### 19. Availability and overlapping bookings

> I need the backend to reject a booking if the requested dates overlap an existing booking. Can you check the date comparison carefully, including the case where one booking checks out on the same day another booking checks in? That case should be allowed.

### 20. Idempotency

> I want to protect the booking endpoint from duplicate requests. I'm planning to send an Idempotency-Key from the frontend. If the same key is sent again, it should return the original booking instead of creating another one. But if the same key is used with different booking data, it should be rejected. Can you help me implement this cleanly?

### 21. Booking cancellation

> I also need to let users cancel an existing booking. The API should handle an invalid reference and repeated cancellation safely. A stay that has already started shouldn't be cancellable. Can you help me keep these rules in the booking service?

### 22. API error handling

> I want the API errors to follow a consistent format so the frontend can display them properly. Can you help me handle validation errors, unavailable dates, duplicate/idempotency errors, not-found cases and unexpected server errors without putting too much logic in the route handlers?

### 23. Production hardening

> The core API is working now. Can you help me add the production-level basics: validate the config at startup, add structured logs with a request ID, Helmet, a CORS allow-list, rate limits, SQL migrations, health and readiness endpoints, graceful shutdown, an OpenAPI document and a small read-only admin page?

### 24. Docker and CI

> I need to containerize the API and add a GitHub Actions workflow. The workflow should run lint, build and the backend tests. Can you help me set up the Dockerfile and CI workflow? I won't be able to run the workflow in my current build environment, so keep that in mind.

## Debugging and testing

### 25. Debugging the booking flow

> The booking request is reaching the backend, but something isn't updating properly on the frontend afterward. Here are the API response, booking component and availability hook. Can you trace the flow from clicking Reserve through the API response and tell me where the state needs to be updated?

### 26. Backend validation testing

> I want to test the actual booking rules instead of just checking whether the endpoint returns 200. Can you help me cover invalid dates, past dates, maximum stay length, guest limits, unavailable dates, cancellation and duplicate requests?

### 27. Testing concurrent bookings

> I want to make sure two requests can't successfully book the same dates at the same time. How can I write a test that sends several booking requests in parallel and checks that only one of them succeeds?

### 28. API/security review

> Can you review the backend for basic API security issues? I want to check things like malformed JSON, oversized requests, invalid idempotency keys, rate limiting, CORS, authorization for admin endpoints and consistent error responses. Keep the changes reasonable for this project.

## Accessibility, documentation and AI setup

### 29. Accessibility pass

> Can you do an accessibility pass on the overlays and interactive elements? I want every overlay to be a real dialog with `role="dialog"`, `aria-modal` and an accessible name. Use the shared `useDialog` hook for focus-in, Tab trapping, Esc and focus return. Also replace clickable divs with buttons, add visible focus rings and handle `prefers-reduced-motion`.

### 30. Architecture diagram

> I need a production-scale architecture diagram for the project. Include the CDN and edge, API gateway, domain services, data stores, search, queue and multi-region deployment. I need the diagram available as PNG, PDF and SVG under `docs/architecture`.

### 31. AI workflow files

> I want to document the rules for coding agents in the project. Can you help me create `CLAUDE.md` and `AGENTS.md`, add three review sub-agents for UI fidelity, accessibility and code quality under `.claude/agents/`, and create a `pixel-clone` skill?

## Final reviews

### 32. Final frontend review

> The main functionality is finished. Can you review the React side like you're doing a pull request review? Look for unnecessary state, duplicated logic, components that are doing too much, unused code and anything that could make the project harder to maintain. Don't rewrite working code just for the sake of it.

### 33. Final UI review

> Can you compare the current UI with the reference and tell me what visual differences are still noticeable? Focus mainly on spacing, typography, image proportions, borders, alignment and responsive behavior. I want targeted fixes, not another redesign.

### 34. Final project cleanup

> I'm getting the project ready for an interview. Can you do one final review of both the frontend and backend for unused imports, console logs, unnecessary dependencies, inconsistent naming, missing error handling and other obvious cleanup? Don't change the functionality unless there's an actual issue.
