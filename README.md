# ITI Node.js Polling Data Aggregation API

This project is an **ITI trainee team task** built as a production-style backend using **Node.js (Express) + MongoDB (Mongoose)**.

## Team & Work Split

1. **Ahmed Ayman (Me)**  
   Team lead of the project. Responsible for the GitHub repository, MongoDB Atlas setup, overall project structure, and coordinating the work split between team members. Also initialized the project folders/files for `auth`, `user`, `middleware`, and `utils`, and implemented the core error handling and security foundations.

2. **Walaa Tharwat**  
   Implemented **polls** (poll model + controller/routes).

3. **Thomas Georguos**  
   Implemented **votes** (vote model + controller/routes, voting rules).

4. **Sara Rashad**  
   Implemented **results** and analytics endpoints.

5. **Hagar Abdelatiff**  
   Implemented **options** (options model + controller/routes).

## Idea

Users can create polls, add options to polls, and vote on a specific option inside a poll. The system also provides analytics/results:

- Polls + options listing
- Voting with duplicate-vote prevention
- Results endpoints that return vote counts and percentages
- **Optimized results reads** using a stored aggregation collection to avoid running heavy MongoDB aggregation on every request

## Tech Stack

- **Express** (API server)
- **MongoDB + Mongoose**
- **Auth**:
  - JWT stored in an `httpOnly` cookie
  - Google OAuth using Passport
  - Password hashing with `bcrypt`
- **Security middleware**:
  - `helmet`
  - `cors`
  - `express-mongo-sanitize`
  - `xss` sanitization
  - `hpp` (parameter pollution protection)
  - rate limiting for auth endpoints
- **Emails** (password reset + welcome email in development/production setups)

## Folder Structure (Current)

- `src/auth/` - auth services, Passport strategy, password reset flow
- `src/user/` - user model/controller/routes + roles (`user` / `admin`)
- `src/middleware/` - `protect`, `restrictTo`, global error handler, rate limiting
- `src/poll/` - poll model/controller/routes
- `src/options/` - option model/controller/routes
- `src/votes/` - vote model/controller/routes (duplicate vote prevention + counters sync)
- `src/results/` - results controller/routes + stored results model
- `src/utils/` - helpers (`catchAsync`, `AppError`, token utilities)

## Data Model (High Level)

- `User`
  - `role`: `user` or `admin`
  - `image`: stores **Cloudinary URL** (frontend uploads, backend stores URL)
- `Poll`
  - `createdBy`: user id
  - `expiresAt`, `isActive`
- `Option`
  - `pollId`
  - `text`
- `Vote`
  - `userId`, `pollId`, `optionId`
  - unique compound index on `(userId, pollId)` to prevent voting twice per poll
- `PollResult` (optimization)
  - one document per `pollId`
  - stores `totalVotes` and `votesByOptionId` to make reads fast

## Stored Results Optimization (Performance)

Instead of aggregating votes on every `GET /results/:pollId`, the project maintains a `PollResult` collection:

- On vote create/update/delete, the API updates:
  - `totalVotes`
  - `votesByOptionId[optionId]`
- The results endpoint reads from `PollResult` (fast)
- If data is missing (old polls), the endpoint falls back to aggregation and then **lazy backfills** `PollResult`

## Cloudinary (User Profile Image)

The backend expects the frontend to upload the image to Cloudinary and send the returned URL as:

- `image` field in `User`

This avoids uploading binary files from the backend and keeps the API clean.

## Running the Project

1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - Copy `.development.env` to `.env` (or update your setup) and fill the values.
3. Start:
   - `npm run dev` (uses `nodemon server.js`)

### Environment Variables

This repository uses `.development.env`. Required keys include:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_TOKEN`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- Email config:
  - `SENDGRID_API_KEY` (production)
  - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` (development)
- `BASE_URL`
- Google OAuth:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL`

## Notes

- `npm test` is currently not configured (focus is on API + business logic).
- For full performance benefits, ensure `PollResult` writes succeed in the same MongoDB deployment (transactions support matters depending on your MongoDB setup).

