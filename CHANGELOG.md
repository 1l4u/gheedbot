# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Complete documentation for GitHub

## [1.0.0] - 2024-12-XX

### Added
- **HR Calculator System**
  - `/hr` command for private HR calculation interface
  - `/setuphr` command for public HR calculator in channels
  - Multi-user support with data isolation
  - Interactive modal forms for each rune group
  - Real-time calculation and ephemeral responses

- **Game Lookup Commands**
  - `/rw <name>` - Runeword lookup with autocomplete
  - `/weapon <name>` - Weapon information lookup
  - `/wiki <keyword>` - Wiki search functionality

- **Calculator Commands**
  - `/chance <ds> <cs> <wm>` - Critical chance calculator
  - `/tas <ias> <fanat> <wsm>` - Total Attack Speed calculator
  - `/ias <tas> <fanat> <wsm>` - IAS requirement calculator
  - `/dmgcal <weapon>` - Damage calculator with weapon picker

- **Core Features**
  - Slash command system with autocomplete
  - Permission-based access control
  - GitHub data integration with auto-updates
  - Comprehensive error handling
  - Multi-language support preparation

- **Data Management**
  - JSON-based game data storage
  - Automatic data loading from GitHub
  - Local fallback for offline operation
  - Data validation and caching

- **Testing & Quality**
  - Comprehensive test suite
  - HTML demo interfaces for testing
  - Automated testing scripts
  - Code quality standards

### Technical Details
- **Framework:** Discord.js v14
- **Node.js:** 16.9.0+ support
- **Architecture:** Modular command system
- **Data Sources:** GitHub integration
- **Deployment:** Render.com ready

### Security
- Environment variable configuration
- Token security best practices
- Permission validation system

---

## Version History

### [1.0.0] - Initial Release
- Complete bot functionality
- All core features implemented
- Production ready

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
