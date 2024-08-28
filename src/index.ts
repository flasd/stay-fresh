#!/usr/bin/env node

import fs from "fs";
import { execSync } from "child_process";
import semver from "semver";

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
      installedModules = fs
        .readdirSync("node_modules")
        .flatMap((item) => {
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
        })
        .filter((dependency) => {
          // Check if the installed version matches the one specified in package.json
          const specifiedVersion =
            (packageJson.dependencies &&
              packageJson.dependencies[dependency]) ||
            (packageJson.devDependencies &&
              packageJson.devDependencies[dependency]);

          if (specifiedVersion) {
            // Check if specifiedVersion is not a semVer version (likely a file/git dependency)
            if (!semver.valid(semver.coerce(specifiedVersion))) {
              return true;
            }

            try {
              const installedPackageJson = JSON.parse(
                fs.readFileSync(
                  `node_modules/${dependency}/package.json`,
                  "utf-8"
                )
              );
              const installedVersion = installedPackageJson.version;

              // Use semver to check if the installed version satisfies the specified version
              return semver.satisfies(installedVersion, specifiedVersion);
            } catch (error) {
              console.warn(
                `⚠️ Warning: Unable to read package.json for ${dependency}. Assuming it's not properly installed.`
              );
              return false;
            }
          }

          return true; // If the dependency is not in package.json, we assume it's correctly installed
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

    if (install) {
      console.log(`📦 Detected ${packageManager} as the package manager.`);
      console.log("🚀 Installing missing dependencies...");

      execSync(`${packageManager} install`, { stdio: "inherit" });
      console.log("\n✅ All dependencies have been installed!");
      process.exit(0);
    } else {
      const installCommand = `${packageManager} add ${missingDeps.join(" ")}`;
      console.log(
        "\n📋 You can install missing dependencies with this command:"
      );
      console.log(`   ${installCommand}`);
      console.log(
        "\nOr run stay-fresh check --install to install automatically."
      );

      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
    process.exit(1);
  }
}

main(process.argv.slice(2));
