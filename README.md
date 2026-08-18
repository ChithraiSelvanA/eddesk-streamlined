# EdDesk Flow

I want to design a modern SaaS admin panel for a School Management System called "EdDesk One".

This is NOT a traditional ERP. I want an extremely simple, workflow-driven UI instead of a menu-driven UI.

## Design Philosophy

- Think like Apple, Linear, Notion and Stripe.

- Every screen should feel clean and uncluttered.

- Reduce the number of sidebar menus as much as possible.

- Do NOT create a menu for every feature.

- Users should complete tasks with the fewest clicks.

- Every entity should have one "home" screen.

- All actions should happen inside the relevant screen instead of opening many different pages.

Example:

Do NOT create menus like:

- Admission

- Student Profile

- ID Card

- Transfer Student

- Record Payment

Instead:

Students

    → Classroom

        → Student List

            → Student Profile

Inside Student Profile show:

- Overview

- Parents

- Fees

- Attendance

- Report Cards

- Documents

- Timeline

Actions:

- Edit Profile

- Print ID Card

- Transfer Student

- Record Payment

- Payment History

- Send Message

Everything should stay inside the Student Profile.

--------------------------------------------------

## Sidebar

Dashboard

Academic

Students

Parents

Fees

Communication

Reports

Settings

Nothing more.

--------------------------------------------------

## Dashboard

The dashboard should not be statistics only.

Show actionable cards.

Examples:

- Pending Fees

- Today's Attendance

- Unread Parent Messages

- Leave Requests

- Recent Admissions

- Upcoming Events

Also include Quick Actions:

+ New Admission

+ Record Payment

+ Create Notice

+ Add Class

--------------------------------------------------

## Academic Module

Manage:

- Academic Year

- Classes

- Subjects

- Teachers

- Timetable

- Holidays

Workflow:

Academic

    → Classes

        → Class Details

            → Students

            → Subjects

            → Teachers

            → Attendance

            → Timetable

Subject List should be a master list.

Classes map subjects from the master list.

--------------------------------------------------

## Students Module

Students

↓

Classrooms

↓

Select Class

↓

Student List

↓

Student Profile

Student Profile should contain tabs:

Overview

Parents

Attendance

Fees

Report Cards

Documents

Communication

Timeline

No separate pages for these.

--------------------------------------------------

## Parents Module

Search by:

- Mobile Number

- Parent Name

Parent Profile contains:

- Children

- Chats

- Requests

- Payment Summary

--------------------------------------------------

## Fees Module

Simple.

Show:

Pending Fees

Payments

Receipts

Reports

When opening a student from Fees, always navigate to the Student Profile > Fees tab.

--------------------------------------------------

## Communication

Notice Board

Events

Chat

Request & Acknowledgement

Notifications

Everything should use cards and clean layouts.

--------------------------------------------------

## Search

There should be a global search in the header.

Search by:

Student Name

Admission Number

Parent Mobile Number

Parent Name

The search should directly open the Student or Parent Profile.

--------------------------------------------------

## UI Style

Very modern.

Lots of whitespace.

Rounded cards.

Minimal colors.

Professional.

No crowded tables.

Use expandable panels.

Use breadcrumbs.

Use tabs instead of opening many pages.

Cards instead of nested menus wherever possible.

--------------------------------------------------

## UX Goals

Office staff should never wonder where a feature is.

Every workflow should feel natural.

Maximum 3 clicks to complete common tasks.

The UI should feel more like Notion, Stripe or Linear than a traditional ERP.

Generate desktop-first responsive screens for the complete admin panel.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ebc1b691-925a-49d9-84ef-7151491e0fc3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
