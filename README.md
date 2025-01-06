# GTP-QA (GoTestPro Quality Assurance)

## Overview
This repository contains automated test scripts for GoTestPro, a comprehensive test management platform. The tests are written using Playwright with TypeScript and focus on validating core functionalities of the GoTestPro application.

## Project Structure
```
├── config/
│   └── config.json         # Configuration file with test credentials and URLs
├── tests/
│   └── GTP-LoginFlow/     # Test scripts for login and navigation flows
│       └── gtplogin.spec.ts
├── playwright.config.ts    # Playwright configuration
└── package.json           # Project dependencies and scripts
```

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Setup
1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Configuration
Update `config/config.json` with appropriate test credentials and URLs:
- url: Application URL
- username: Test user email
- password: Test user password

## Running Tests
- Run all tests:
```bash
npx playwright test
```

- Run specific test file:
```bash
npx playwright test tests/GTP-LoginFlow/gtplogin.spec.ts
```

- Run tests with UI mode:
```bash
npx playwright test --ui
```

- View test report:
```bash
npx playwright show-report
```

## Test Coverage
The test suite covers:
- Login/Logout flows
- Navigation to different sections:
  - Projects
  - Tests
  - Test Plans
  - Executions
  - Results
  - Dashboard
  - Users
  - AI Assistant
  - Project Settings
  - Page Elements
  - Configuration

## Contributing
1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request
