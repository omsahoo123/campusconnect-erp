# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Creating a Test Admin User

To test the application as an administrator, you need to create an admin user and provision the role.

### Step 1: Create the User in Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to your project, then go to **Authentication** -> **Users** tab.
3.  Click **Add user**.
4.  Enter the following credentials:
    *   **Email**: `admin@campus.edu`
    *   **Password**: `password`
5.  Click **Add user**.

### Step 2: Provision the Admin Role

1.  Run the application.
2.  Log in using the `admin@campus.edu` email and `password` password.
3.  After logging in, navigate to the `/dashboard/provision-admin` URL in your browser.
4.  Click the "Grant Admin Role" button.

Once completed, the user `admin@campus.edu` will have full administrative privileges across the application.
