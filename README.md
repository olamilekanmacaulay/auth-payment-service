# Wallet Service API

A robust backend service for managing digital wallets, handling Paystack deposits, and facilitating secure user-to-user transfers. Built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Features

-   **Authentication**: Google OAuth2 login with JWT generation.
-   **Wallet Management**:
    -   Automatic wallet creation for users.
    -   9-digit unique numeric wallet numbers.
    -   Balance inquiry and transaction history.
-   **Deposits**:
    -   Integration with **Paystack** for secure funding.
    -   **Webhook** support for real-time transaction verification and wallet crediting.
-   **Transfers**:
    -   Secure, atomic wallet-to-wallet transfers.
    -   Concurrency control to prevent race conditions.
-   **API Key Management**:
    -   Generate API keys for service-to-service access.
    -   Granular permissions (`read`, `deposit`, `transfer`).
    -   Key expiry and rollover functionality.
    -   Limit of 5 active keys per user.
-   **Documentation**: Interactive Swagger API docs.

## 🛠️ Tech Stack

-   **Framework**: NestJS (Node.js)
-   **Database**: PostgreSQL
-   **ORM**: TypeORM
-   **Payment Gateway**: Paystack
-   **Auth**: Passport (Google OAuth, JWT)

## 📋 Prerequisites

-   Node.js (v16+)
-   PostgreSQL Database
-   Paystack Account (Public/Secret Keys)
-   Google Cloud Console Project (Client ID/Secret)

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/wallet-service.git
    cd wallet-service
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    # Database
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_DATABASE=wallet_db

    # JWT
    JWT_SECRET=your_super_secret_jwt_key

    # Google OAuth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback // https://auth-payment-service.onrender.com/auth/google/callback

    # Paystack
    PAYSTACK_SECRET_KEY=your_paystack_secret_key

    # App
    PORT=3000
    NODE_ENV=development
    ```

4.  **Run the Application**
    ```bash
    # Development
    npm run start:dev

    # Production
    npm run start:prod
    ```

## 📖 API Documentation (Swagger)

-   **Live Server**: [https://auth-payment-service.onrender.com/api](https://auth-payment-service.onrender.com/api)
-   **Local**: [http://localhost:3000/api](http://localhost:3000/api)

This provides an interactive interface to test all endpoints.

## 🚀 Deployment (Render)

1.  **Database**: Use a cloud PostgreSQL provider (e.g., Aiven, Render, Neon).
    *   *Note*: Ensure you use a **clean database** to avoid schema conflicts.

2.  **Build Command**: `npm install; npm run build`
3.  **Start Command**: `npm run start:prod`

## 🔒 Security

-   **SSL**: Database connections in production use SSL.
-   **Validation**: Paystack webhooks are verified using HMAC SHA512 signatures.
-   **Guards**: Endpoints are protected by JWT or API Key guards.
-   **Concurrency**: Pessimistic locking is used during transfers to ensure data integrity.
