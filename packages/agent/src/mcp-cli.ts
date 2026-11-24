#!/usr/bin/env node
// Starts the GenoCode MCP server over standard input and output. Saved creatures go into the folder
// given with --out, or the folder it was started in.

import { resolve } from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp.js";

const at = process.argv.indexOf("--out");
const saveDir = resolve(at >= 0 && process.argv[at + 1] ? process.argv[at + 1]! : process.cwd());

await createServer({ saveDir }).connect(new StdioServerTransport());
