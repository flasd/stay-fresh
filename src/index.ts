#!/usr/bin/env node

import fs from "fs";
import { execSync } from "child_process";

export function main(args: string[]) {
  const installFlag = args.includes("--install");

  if (args.includes("check")) {
    checkDependencies(installFlag);
  } else {
    console.log("❓ Usage: stay-fresh check [--install]");
    process.exit(1);
  }
}

function checkDependencies(install: boolean) {
  try {
    let packageJson: {
      engines?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    try {
      packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    } catch (error) {
      console.error("❌ Error: Unable to find or parse package.json");
      console.error(
        "   Please make sure you're in the root directory of your project."
      );
      process.exit(1);
    }

    let installedModules: string[] = [];
    try {
      // Read the contents of the node_modules directory
      installedModules = fs.readdirSync("node_modules").flatMap((item) => {
        const itemPath = `node_modules/${item}`;
        // Check if the item is a directory and starts with "@" (indicating a scoped package)
        if (fs.statSync(itemPath).isDirectory() && item.startsWith("@")) {
          try {
            // For scoped packages, read the subdirectory and map each subitem to "scope/package"
            return fs
              .readdirSync(itemPath)
              .map((subItem) => `${item}/${subItem}`);
          } catch (error) {
            // If there's an error reading the subdirectory, throw a more informative error
            throw new Error(
              `Failed to scan subdirectory ${itemPath}: ${error.message}`
            );
          }
        }
        // For non-scoped packages, return the item name as is
        return item;
      });
    } catch (error) {
      console.warn(
        "⚠️ Warning: Unable to read node_modules directory. Assuming no modules are installed."
      );
    }

    const missingDeps = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ].filter((dep) => !installedModules.includes(dep));

    if (missingDeps.length === 0) {
      console.log("✅ All dependencies are installed!");
      process.exit(0);
    }

    console.log(`🔍 Found ${missingDeps.length} missing dependencies:`);
    missingDeps.forEach((dep) => console.log(`  - ${dep}`));

    if (install) {
      console.log("🚀 Installing missing dependencies...");

      // Detect package manager based on lock file
      let packageManager = packageJson.engines?.npm
        ? "npm"
        : packageJson.engines?.yarn
        ? "yarn"
        : packageJson.engines?.pnpm
        ? "pnpm"
        : packageJson.engines?.bun
        ? "bun"
        : "npm";

      if (fs.existsSync("yarn.lock")) {
        packageManager = "yarn";
      } else if (fs.existsSync("pnpm-lock.yaml")) {
        packageManager = "pnpm";
      } else if (fs.existsSync("bun.lockb")) {
        packageManager = "bun";
      }

      console.log(`📦 Detected ${packageManager} as the package manager.`);

      execSync(`${packageManager} install`, { stdio: "inherit" });
      console.log("\n✅ All dependencies have been installed!");
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
    process.exit(1);
  }
}

main(process.argv.slice(2));
