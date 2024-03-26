# Secrets
 The Secrets web app enables users to anonymously share, read, and create secrets. It incorporates two-factor authentication methods: Google OAuth 2.0 and traditional username-password authentication.
## Features

- **Authentication:** Supports two authentication methods:
  - Google OAuth 2.0: Users can authenticate using their Google accounts.
  - Username-password: Users can register with a username and password.

- **Posting Secrets:** Authenticated users can submit their secrets, which are then displayed anonymously.

- **Viewing Secrets:** Users can read and view secrets posted by other users.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Passport.js
- EJS (Embedded JavaScript)
- Google OAuth 2.0
- dotenv

## Installation

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up a MongoDB database.
4. Create a `.env` file and add your MongoDB URI, Google OAuth client ID, and client secret.
5. Run the application using `npm start`.

## Usage

1. Navigate to the homepage.
2. Register for an account or log in using Google OAuth.
3. Submit your secret or view secrets posted by others.

## Contributing

Contributions are welcome! Please create an issue or submit a pull request with your suggestions or changes.
