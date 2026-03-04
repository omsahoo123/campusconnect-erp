# CampusConnect ERP

This is a Next.js application for CampusConnect ERP.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Simulating Different User Roles

This application uses a mock authentication system to simulate different user roles. You can log in as different users to see their respective dashboards.

The login form is pre-populated with test credentials. To switch roles, simply select a different role from the dropdown on the login page. The email and password fields will update automatically.

Here are the available test roles and their credentials:

| Role      | Email                  | Password   |
| :-------- | :--------------------- | :--------- |
| Admin     | `admin@campus.edu`     | `password` |
| Teacher   | `e.vance@campus.edu`   | `password` |
| Student   | `student@campus.edu`   | `password` |
| Finance   | `finance@campus.edu`   | `password` |

Since this is a mock system, the user's session is not persisted across page reloads.
