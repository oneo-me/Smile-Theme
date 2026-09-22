import { build } from "./build";
import { packageVscode } from "./package-vscode";
import { packageZed } from "./package-zed";

// One build feeds both archives: the editors share the icon assets, and packaging each
// editor on its own would repeat the same build and validation.
await build();
await packageVscode();
await packageZed();
