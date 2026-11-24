#!/usr/bin/env node
// Starts the GenoCode MCP server over standard input and output. Saved creatures go into the folder
// given with --out, made if it isn't there yet, or the folder it was started in.

import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp.js";

const at = process.argv.indexOf("--out");
const saveDir = resolve(at >= 0 && process.argv[at + 1] ? process.argv[at + 1]! : process.cwd());
mkdirSync(saveDir, { recursive: true });

await createServer({ saveDir }).connect(new StdioServerTransport());
