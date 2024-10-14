# Contributing to Zephyr

Thank you for your interest in contributing to Zephyr! We're excited to welcome contributors from all backgrounds and experience levels. This document provides guidelines and information to help you get started with contributing to our monorepo project.

## Table of Contents

- [Contributing to Zephyr](#contributing-to-zephyr)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Hacktoberfest Participation](#hacktoberfest-participation)
    - [Hacktoberfest Guidelines](#hacktoberfest-guidelines)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
    - [Conventional Commits](#conventional-commits)
  - [Pull Request Process](#pull-request-process)
    - [PR Title Format](#pr-title-format)
  - [Coding Standards](#coding-standards)
    - [Code Style](#code-style)
  - [License](#license)
    - [What does AGPL mean for contributors?](#what-does-agpl-mean-for-contributors)
  - [Questions or Need Help?](#questions-or-need-help)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to understand what kind of behavior will and will not be tolerated.

## Hacktoberfest Participation

This repository participates in Hacktoberfest! We welcome contributions throughout October and have labeled issues that are good for first-time contributors with `hacktoberfest` and `good-first-issue` tags.

### Hacktoberfest Guidelines

- Pull requests should be meaningful and address an existing issue
- Low-quality PRs (like typo fixes) may be marked as `invalid` or `spam`
- Check the [Hacktoberfest quality standards](https://hacktoberfest.digitalocean.com/resources/qualitystandards) before submitting

## Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/parazeeknova/zephyr.git
   cd zephyr
   ```

2. **Install dependencies**
   We use pnpm as our package manager

   ```bash
   pnpm install
   ```

3. **Set up development environment**

   ```bash
   # Get an example / temp database from vercel for `.env` file and place it in `packages/db`.
   # Get your storage bucket from uploadthing and add it to `.env` file, Will be replaced with amazon s3 bucket later.
   # Format is in `.env.example` file
   ```

4. **Run the development servers**

   ```bash
   turbo dev
   ```

## Development Workflow

1. **Choose an issue** to work on or create a new one
2. **Create a new branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them using conventional commits:

   ```bash
   git commit -m "feat: add new social sharing feature"
   ```

4. **Push your branch** and create a pull request

### Conventional Commits

We follow the Conventional Commits specification. Commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```
feat(frontend): add new user profile page

- Implement responsive design
- Add avatar upload functionality

Closes #123
```

## Pull Request Process

1. Ensure your PR addresses an existing issue (if not, create one)
2. Update documentation as needed
3. Add tests for new features
4. Make sure all tests pass
5. Get at least one code review from a maintainer
6. Once approved, a maintainer will merge your PR

### PR Title Format

Follow the same convention as commit messages:

```
feat(scope): brief description
```

## Coding Standards

- **Frontend:** We use Biome
- **Backend:** Follow Node.js best practices
- **Testing:** Write unit tests for new features (soon to be implemented)
- **Documentation:** Update relevant documentation as needed

### Code Style

```bash
# Check code style
pnpm run biome:check

# Fix code style issues
pnpm run biome:fix
```

## License

This project is licensed under the AGPL License - see the [LICENSE](LICENSE) file for details. By contributing, you agree to license your contributions under the same license.

### What does AGPL mean for contributors?

- Your contributions must also be licensed under AGPL
- If you modify and distribute the code, you must make your changes available under AGPL
- Network use is considered distribution, so if you run a modified version of the software as a service, you must make your changes available

## Questions or Need Help?

- Create an issue for bugs or feature requests

Thank you for contributing to make this project better! 🎉
