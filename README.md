# Complete Church Connect

**One Church. One Community. One Connected Platform.**

A responsive church membership and administration workspace built with a navy-and-gold visual identity.

## Current status

Stage 1 frontend preview is being developed in Floot. The current interface uses fictional demonstration records only.

Included views:
- Dashboard and membership overview
- Member directory and search
- Registration demonstration form
- Youth Connect
- Ministries and departments
- Events and attendance overview
- Reports and analytics preview
- Settings and role overview

## Important

This repository is a source snapshot of the Floot-hosted project, not a standalone deployable React project yet. The app currently imports Floot's shared component kit and uses Floot's page/runtime conventions. Backend persistence, real authentication, role enforcement, secure youth-data handling, audit logs, exports, and Android packaging are not yet implemented.

Do not enter real member information into the demo interface.

## Planned next stage

1. Provision managed PostgreSQL and authentication.
2. Design normalized membership, ministry, event, attendance and youth-profile tables.
3. Enforce permissions server-side and apply data-minimization safeguards.
4. Wire registration and member directory to the database.
5. Add tests, backups, audit logging and export workflows.
6. Prepare and test the Android build.

## Design

- Navy: `#0B1930`
- Gold: `#D4AF62`
- Display type: Newsreader
- Interface type: IBM Plex Sans
