# Changelog

## Unreleased

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
