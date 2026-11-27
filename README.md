# Complete Church Connect

**One Church. One Community. One Connected Platform.**

A responsive church membership and administration workspace for web and Android, built with a modern navy-and-gold visual identity.

## Current implementation

The app is hosted in Floot. This repository is a source snapshot of the project and is not yet a standalone deployable React application.

Implemented:
- Responsive dashboard, member directory, registration, Youth Connect, ministries, events, reports and settings views.
- Floot-managed PostgreSQL database and authentication.
- Secure password login, logout, session handling and password-reset flows.
- Server-side church role and branch checks for member endpoints.
- Member registration with generated membership IDs.
- Branch-scoped member directory that returns only directory-safe fields.
- Audit-log entries for member creation.
- Guardian-consent safeguards for storing youth education, skills, talent, career and profession details.
- Navy #0B1930 and gold #D4AF62 design system.

## Database modules

The database includes branches, ministries, members, member-to-ministry assignments, youth profiles, church events, event attendance, user access profiles and audit logs.

## Security notes

- Member APIs require an authenticated and active church access profile.
- Member directory access and registration are limited to authorized leadership roles on the server.
- Private contact fields are not returned by the directory endpoint.
- Youth-related profile details for minors are not stored unless guardian consent has been confirmed.
- Use real member data only in the authenticated app, with appropriate church authorization and privacy notices. Do not commit personal member data, passwords, reset codes or secrets to this repository.

## Remaining work

- Complete member profile view, editing, archive/deactivation and role-aware UI.
- Database-backed ministry management and event/attendance workflows.
- Reports based on live database data and safe export functionality.
- Complete role/branch administration and additional authorization tests.
- Final browser/mobile QA, backups and Android build verification.
- Production publishing (not yet published).

## Design

- Navy: #0B1930
- Gold: #D4AF62
- Display type: Newsreader
- Interface type: IBM Plex Sans
