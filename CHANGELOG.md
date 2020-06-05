# Changelog

## Unreleased

- better sauce command (input url)
- Find a _better_ way to not get rate limited (timeouts?) (might not be needed after a timeout. need to waste time finding a smarter way of doing it)
- Refactor the code x2 (finish)
- Comments (finish)
- Generalize even more the page cycle system so it can be reused for everything more easily (need to focus on this)
- Refactor command logic (make all command functions static on the classes and then use getInstance if necessary)

---

## [1.1.0] - 2020-06-05

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

## [1.0.5] - 2020-05-20

### Added

- SauceNao search last image posted

---

## [1.0.4] - 2020-04-25

### Added

- Mal and Fandom request cache
- Some comments for documentation
- Reaction page cycle for mal as well

### Changed

- Partial code refactoring

### Removed

- Anime command (still need to clean up), for now only that'll be used is mal

---

## [1.0.3] - 2020-04-23

### Added

- Wiki search page search through reactions

---

## [1.0.2] - 2020-04-21

### Added

- Wiki Search

---

## [1.0.1] - 2020-03-28

### Added

- Show all mal results and allow selection for more info
