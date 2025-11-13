# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Creating Test Users

To test the application, you need to create user accounts in Firebase Authentication. You can log in with different roles to see different dashboards.

### Step 1: Create the Users in Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to your project, then go to **Authentication** -> **Users** tab.
3.  Click **Add user** and create the following four users. Use `password` as the password for all of them.

| Role      | Email                  | Password   |
| :-------- | :--------------------- | :--------- |
| Admin     | `admin@campus.edu`     | `password` |
| Teacher   | `e.vance@campus.edu`   | `password` |
| Student   | `student@campus.edu`   | `password` |
| Finance   | `finance@campus.edu`   | `password` |

### Step 2: Provision the Admin Role

The admin user requires special privileges that must be granted after the account is created.

1.  Run the application.
2.  Log in using the `admin@campus.edu` email and `password` password.
3.  After logging in, navigate to the `/dashboard/provision-admin` URL in your browser.
4.  Click the "Grant Admin Role" button.

Once completed, the user `admin@campus.edu` will have full administrative privileges across the application. The other users will automatically have their correct roles based on their email address.
