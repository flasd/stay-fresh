# stay-fresh

Ensuring all dependencies are properly installed is crucial for smooth development and CI processes. Missing dependencies can lead to unexpected errors and failed builds.

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

For Git hooks, you can use Husky to run stay-fresh on checkout and pull. First, install Husky:

```sh
yarn add husky
```

Then, add the following to your `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

and run the following command:

```sh
echo "post-checkout" > .husky/post-checkout
echo "post-merge" > .husky/post-merge
```

Now open the created files and replace the content with the following:

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

yarn stay-fresh check --install

```

Do the same for the `post-merge` file.

Done! 🎉

This setup ensures that your dependencies are always up-to-date:

1. Before running your development server, stay-fresh will automatically check and install any missing dependencies.
2. After pulling changes or switching branches, stay-fresh will run automatically to ensure your local environment matches the project requirements.

By integrating stay-fresh into your workflow, you'll maintain a consistent development environment across your team and prevent errors caused by missing or outdated dependencies. This approach streamlines your development process and helps avoid "it works on my machine" scenarios, leading to smoother collaboration and more reliable CI/CD pipelines.
