# stay-fresh

Ensuring all dependencies are properly installed is crucial for smooth development and CI processes. Missing dependencies can lead to unexpected errors and failed builds.

For example, if a team member adds a new dependency but forgets to commit the updated `package.json`, other developers or CI pipelines might encounter errors when running the project.

This package helps you avoid these issues by checking for missing dependencies and optionally installing them before running your development server or CI commands.

### Installation

```sh
yarn add @flasd/stay-fresh
```

### Usage

Run the following command in your project directory before starting your development server or in your CI pipeline:

```sh
stay-fresh check [--install]
```

### Options

- `--install`: Installs missing dependencies before running the command.

### Features

- Detects missing dependencies by comparing `package.json` with installed modules.
- Supports multiple package managers (npm, yarn, pnpm, bun).
- Automatically detects the package manager based on lock files.
- Option to automatically install missing dependencies.

### Example

```sh
$ stay-fresh check
🔍 Found 2 missing dependencies:
  - lodash
  - express

$ stay-fresh check --install
🔍 Found 2 missing dependencies:
  - lodash
  - express
🚀 Installing missing dependencies...
📦 Detected npm as the package manager.
... (installation output)
✅ All dependencies have been installed!
```

### Recommended Setup

Add stay-fresh to your npm scripts in `package.json`:

```json
{
  "scripts": {
    "predev": "stay-fresh check --install",
    "dev": "your-dev-command"
  }
}
```

For CI, add it as a step in your pipeline:

```yaml
steps:
  - name: Install dependencies
    run: npm install
  - name: Check dependencies
    run: npx stay-fresh check
  - name: Run tests
    run: npm test
```

This ensures all dependencies are properly installed before running your development server or CI commands, preventing errors due to missing modules.

For more details on the implementation, check the `src/index.ts` file.

This tool helps you maintain a consistent development environment and smooth CI process by ensuring all necessary dependencies are installed before running your project.