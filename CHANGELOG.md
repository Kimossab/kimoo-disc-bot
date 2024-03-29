# Changelog

## [2.4.0] - 2021-10-04

### Changed

- Modules now use classes to make it easier to create new ones

### Added

- More tests (the need of which is at least questionable, but just practice)
- Anilist integration

### Removed

- MAL Module
- Subscription Module

## [2.3.3] - 2021-07-08 - Hotfix

### Fixed

- Change method to get OG tags from livechart since they added stronger cloudflare protection

---

## [2.3.2] - 2021-04-30

### Changed

- Changed trace moe endpoint
  - Using the trace moe public api again, instead of the api used in the site. 
- Livechart anime info
  - Started using open graph info from the livechart url to get more info about the name (like name and description)

---

## [2.3.1] - 2021-04-14

### Fixed

- VNDB TCP communication behaviour
- Achievement's link to images that don't exist (shows up as `null` on mobile)

---

## [2.3.0] - 2021-04-03

### Added

- Added VNDB module

---

## [2.2.0] - 2021-03-28

### Added

- Added module Achievements
  - Server achievements
  - Achievement Ranks
- Added prevention of rate limits in discord requests
- VSCode snippets for modules and commands

### Changed
- Small refactor on modules
  - Changed file structure, now there's a folder for each module and its related files
- Discord interactions now follow the correct setup of acknowledging the interaction and later updating the message
- Since interaction token only lasts for 15 minutes paginations are now supposed to self destroy after 15 minutes

---

## [2.1.2] - 2021-03-12

### Changed

- Trace.moe api to use the same as website (it's slower but gives better results)

### Fixed

- Birthday timeout calculation (it was sending at 02:02:02 instead of 00:00:00)
- Small bug fixes like missing values in embeds in messages

---

## [2.1.1] - 2021-01-27

### Added

- Add await to all create interaction responses

---

## [2.1.0] - 2021-01-27

### Fixed

- Fixed errors caused from not handling reconnection requests properly.

---

## [2.0.5] - 2021-01-27

### Fixed

- Fixed resume event, had mistakenly been looking for opcode resume. The opcode is only for sending, the resumed is an event that's received as a message data.
- More logs to see if the situation improves

---

## [2.0.4] - 2021-01-27

### Changed

- Changed last S and session id from socket to the state store.
- More logs to try and understand why discord is constantly asking my bot to reconnect and giving invalid session.

---

## [2.0.3] - 2021-01-26

### Fixed

- Removed double connection when recoonect is received

---

## [2.0.2] - 2021-01-24

### Added

- Get birthdays by month
- Get birthday channel

### Fixed

- Fixed error with closing websocket codes. Now it uses default codes.

---

## [2.0.1] - 2021-01-24

### Added

- Added time to logs

### Changed

- Changed time for bot presence update

### Fixed

- Fixed mal interaction response with wrong order

### Removed

- Remove log for default socket event

---

## [2.0.0] - 2021-01-23

### Added

- Trace.moe implementation

### Changed

- Discord api version 6 to 8
- Commands are now discord slash commands
- MySQLite to MongoDB
- Restructure of the code, easier to read and modify
- Wiki queries (their services changed and my code stopped working)

---

## [1.0.0] - 2020-09-05

### Added

- Updated node packages
- List and Remove anime subscription commands
- More documentation comments

---

## [0.2.0] - 2020-07-14

### Added

- Anime air notification subscription
- Simple logging system

---

## [0.1.1] - 2020-06-12

### Added

- Server Birthday
- Get Birthday
- Remove Birthday

---

## [0.1.0] - 2020-06-05

### Added

- Birthday module
  - Set birthday by admins
  - Send a "happy birthday" message on the day
- Admin module
  - Set language
  - Set bot trigger
- Database
- More translations

### Changed

- More code refactoring
  - Most classes turned into Singletons

### Removed

- Anime command (clean up)
  - Kitsu requests

---

## [0.0.5] - 2020-05-20

### Added

- SauceNao search last image posted

---

## [0.0.4] - 2020-04-25

### Added

- Mal and Fandom request cache
- Some comments for documentation
- Reaction page cycle for mal as well

### Changed

- Partial code refactoring

### Removed

- Anime command (still need to clean up), for now only that'll be used is mal

---

## [0.0.3] - 2020-04-23

### Added

- Wiki search page search through reactions

---

## [0.0.2] - 2020-04-21

### Added

- Wiki Search

---

## [0.0.1] - 2020-03-28

### Added

- Show all mal results and allow selection for more info
