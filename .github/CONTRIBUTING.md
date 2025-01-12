#### _<div align="left"><sub>// Contribution in Zephyr</sub></div>_

Thank you for your interest in contributing to Zephyr! This guide will help you start contributing to our community-driven platform.

## TABLE OF CONTENTS
1. [Making Contributions](#-making-contributions)
2. [Code Standards](#-code-standards)
3. [Troubleshooting](#-troubleshooting)
4. [Community Guidelines](#-community-guidelines)

#### _<div align="left"><sub>// Making Contributions</sub></div>_

###### _<div align="left"><sub>// Workflow</sub></div>_

```sh
1. Fork the repository
2. Clone the forked repository
3. Create a new branch (git checkout -b feature/branch-name)
4. Make changes
5. Format changes (pnpm run biome:fix)
6. Commit changes (git commit -am 'feat[SOME]: Some changes')
7. Push changes (git push origin feature/branch-name)
8. Create a pull request

```

###### _<div align="left"><sub>// Development Commands</sub></div>_

```sh
# Start development server
pnpm turbo dev

# Start development backend server (docker services)
pnpm run start
```

```sh
# Formatting check
pnpm biome:check
```

```sh
# Docker clean
pnpm run docker:interactive
```

```sh
# Formatting fix
pnpm biome:fix
```

#### _<div align="left"><sub>// Code Standards</sub></div>_

###### _<div align="left"><sub>// Style rules</sub></div>_

- Use TypeScript
- Follow Biome config
- Keep files focused
- Comment complex logic
- Use meaningful names

###### _<div align="left"><sub>// Commit messages</sub></div>_

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code change
- `test`: Adding tests
- `chore`: Maintenance
- `perf`: Performance
- `ci`: Continuous integration
- `build`: Build system
- `revert`: Revert changes
- `wip`: Work in progress

example: `feat[MODULE]: Add new module`

#### _<div align="left"><sub>// Troubleshooting</sub></div>_

**Having trouble?** [Open an issue](https://github.com/parazeeknova/zephyr/issues)


###### _<div align="left"><sub>// Common Issues</sub></div>_

1. Database Connection:
  - Verify PostgreSQL is running
  - Check port conflicts
  - Validate connection string

2. Environment:
  - Confirm all variables set
  - Check file locations
  - Validate syntax

3. Build Errors:
  - Clear `node_modules`
  - Rebuild dependencies
  - Check Docker logs

#### _<div align="left"><sub>// Community Guidelines</sub></div>_

###### _<div align="left"><sub>// Code of Conduct</sub></div>_
- Be respectful
- Stay on topic
- Help others
- Follow code of conduct

###### _<div align="left"><sub>// Reporting Issues</sub></div>_
- Check existing issues
- Provide reproduction
- Be specific
- Follow templates & labels
- Include logs or screenshots if needed

###### _<div align="left"><sub>// Pull Requests</sub></div>_
- Link related issues
- Describe changes
- Update docs

Thank you for contributing to Zephyr!
