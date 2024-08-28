#!/usr/bin/env node
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var fs_1 = __importDefault(require("fs"));
var child_process_1 = require("child_process");
function main(args) {
    var installFlag = args.includes("--install");
    if (args.includes("check")) {
        checkDependencies(installFlag);
    }
    else {
        console.log("❓ Usage: stay-fresh check [--install]");
        process.exit(1);
    }
}
exports.main = main;
function checkDependencies(install) {
    var _a, _b, _c, _d;
    try {
        var packageJson = void 0;
        try {
            packageJson = JSON.parse(fs_1.default.readFileSync("package.json", "utf-8"));
        }
        catch (error) {
            console.error("❌ Error: Unable to find or parse package.json");
            console.error("   Please make sure you're in the root directory of your project.");
            process.exit(1);
        }
        var installedModules_1 = [];
        try {
            // Read the contents of the node_modules directory
            installedModules_1 = fs_1.default.readdirSync("node_modules").flatMap(function (item) {
                var itemPath = "node_modules/".concat(item);
                // Check if the item is a directory and starts with "@" (indicating a scoped package)
                if (fs_1.default.statSync(itemPath).isDirectory() && item.startsWith("@")) {
                    try {
                        // For scoped packages, read the subdirectory and map each subitem to "scope/package"
                        return fs_1.default
                            .readdirSync(itemPath)
                            .map(function (subItem) { return "".concat(item, "/").concat(subItem); });
                    }
                    catch (error) {
                        // If there's an error reading the subdirectory, throw a more informative error
                        throw new Error("Failed to scan subdirectory ".concat(itemPath, ": ").concat(error.message));
                    }
                }
                // For non-scoped packages, return the item name as is
                return item;
            });
        }
        catch (error) {
            console.warn("⚠️ Warning: Unable to read node_modules directory. Assuming no modules are installed.");
        }
        var missingDeps = __spreadArray(__spreadArray([], Object.keys(packageJson.dependencies || {}), true), Object.keys(packageJson.devDependencies || {}), true).filter(function (dep) { return !installedModules_1.includes(dep); });
        if (missingDeps.length === 0) {
            console.log("✅ All dependencies are installed!");
            process.exit(0);
        }
        console.log("\uD83D\uDD0D Found ".concat(missingDeps.length, " missing dependencies:"));
        missingDeps.forEach(function (dep) { return console.log("  - ".concat(dep)); });
        if (install) {
            console.log("🚀 Installing missing dependencies...");
            // Detect package manager based on lock file
            var packageManager = ((_a = packageJson.engines) === null || _a === void 0 ? void 0 : _a.npm)
                ? "npm"
                : ((_b = packageJson.engines) === null || _b === void 0 ? void 0 : _b.yarn)
                    ? "yarn"
                    : ((_c = packageJson.engines) === null || _c === void 0 ? void 0 : _c.pnpm)
                        ? "pnpm"
                        : ((_d = packageJson.engines) === null || _d === void 0 ? void 0 : _d.bun)
                            ? "bun"
                            : "npm";
            if (fs_1.default.existsSync("yarn.lock")) {
                packageManager = "yarn";
            }
            else if (fs_1.default.existsSync("pnpm-lock.yaml")) {
                packageManager = "pnpm";
            }
            else if (fs_1.default.existsSync("bun.lockb")) {
                packageManager = "bun";
            }
            console.log("\uD83D\uDCE6 Detected ".concat(packageManager, " as the package manager."));
            (0, child_process_1.execSync)("".concat(packageManager, " install"), { stdio: "inherit" });
            console.log("\n✅ All dependencies have been installed!");
            process.exit(0);
        }
        else {
            process.exit(1);
        }
    }
    catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}
main(process.argv.slice(2));
