# Sales Track Academy

Sales Track Academy is a modern training platform built for internal learning and performance tracking. It allows admins to create structured training content, assign courses to users or groups, and monitor progress, while agents can complete lessons, take quizzes, and track their learning journey.

## Tech Stack

- **Frontend:** Next.js
- **Backend:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma

## Project Goals.

The main goals are:

- role-based authentication for admins and agents
- course creation and management
- support for text, PDF, audio, and video lessons
- quiz support with passing scores
- assignment of courses to users or groups
- progress tracking and analytics
- clean, scalable, production-oriented architecture

## Repository Structure

```txt
apps/
  web/        # Next.js frontend
  api/        # NestJS backend

packages/
  database/   # Prisma schema, migrations, seed scripts
  contracts/  # Shared types and API contracts
  storage/    # Storage helpers
  config/     # Shared config
```

## Current Status

This project is in active development.

Initial focus:
- defining the data model
- setting up backend architecture
- implementing authentication and core course flows
- preparing the first end-to-end MVP slice

## Planned Features

- Admin dashboard
- Agent learning dashboard
- Course and lesson management
- Quiz creation and attempts
- Group-based course assignment
- Lesson comments
- Progress and completion analytics
- In-browser PDF viewing
- Media upload and delivery

## Development Approach


1. design the schema
2. implement authentication
3. build core course and assignment flows
4. connect the frontend to real backend contracts
5. iterate toward a polished MVP

## Getting Started

Setup instructions will be added as the project structure stabilizes.

## Notes

This README is an initial draft and will evolve as the architecture, setup process, and feature set become more concrete.

