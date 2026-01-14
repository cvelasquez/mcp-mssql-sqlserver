# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MCP SQL Server** is a Model Context Protocol (MCP) server that enables AI agents (Claude Desktop, ChatGPT, GitHub Copilot, Google Gemini, and other MCP-compatible assistants) to interact with multiple SQL Server instances. It provides centralized connection management with hot-reload capabilities, database schema analysis, query execution, and performance optimization tools.

**Key Architecture:**
- Single-file Node.js MCP server (`index.js`) using `@modelcontextprotocol/sdk`
- Centralized connection configuration in `connections.json` (NOT committed to git)
- Connection pooling with `mssql` library for efficient database access
- Standard MCP tool/request handler pattern

## Development Commands

### Setup and Installation
```bash
# Install dependencies
npm install

# Copy template for local development
cp connections.template.json connections.json
# Then edit connections.json with your database credentials
```

### Running the Server
```bash
# Start MCP server (normally run by Claude Desktop, not manually)
npm start
# or
node index.js
```

### Testing
No automated test suite exists currently. Manual testing is done through any MCP-compatible AI agent by:
1. Configuring your AI agent's MCP configuration file with the server path
2. Restarting your AI agent
3. Using natural language commands to test tools (e.g., "List all SQL Server connections")

**Examples for different agents:**
- **Claude Desktop**: Configure `claude_desktop_config.json`
- **ChatGPT**: Follow ChatGPT's MCP configuration instructions
- **Other agents**: Consult specific agent documentation for MCP setup

## Architecture & Key Concepts

### Connection Management (Core Pattern)
The codebase implements a **centralized multi-connection architecture**:

1. **connections.json**: Central configuration file defining all database connections
   - Each connection has: `name`, `connectionGroup`, `description`, `server`, `database`, credentials, and SSL settings
   - `connectionGroup` organizes connections by client/project/environment
   - File is gitignored as it contains credentials in plain text

2. **Connection Pool Map** (`connectionPools`): In-memory Map storing active connection pools
   - Lazy initialization: Pools created on first use via `getConnectionPool()`
   - Reused across multiple tool calls for performance
   - Automatically closed and cleared when `reload_connections` is called

3. **Hot-Reload Pattern**: The `loadConnections()` function can be called at runtime
   - `reload_connections` tool closes all existing pools and reloads `connections.json`
   - Enables adding/modifying connections without restarting your AI agent

### MCP Server Architecture
Standard MCP pattern with two main request handlers:

1. **ListToolsRequestSchema**: Defines 7 available tools with their input schemas
2. **CallToolRequestSchema**: Routes tool calls to appropriate handlers with error handling

All tools (except `list_connections` and `reload_connections`) return responses with metadata including connection info, enabling traceability.

### Tool Categories
- **Connection Management**: `list_connections`, `reload_connections`
- **Query Execution**: `query`
- **Schema Inspection**: `get_schema`, `get_indexes`
- **Performance Analysis**: `get_execution_plan` (uses `SHOWPLAN_XML`)
- **Code Inspection**: `get_stored_procedure`

## Important Files

### Core Files
- **index.js**: Main MCP server implementation (505 lines)
- **connections.json**: Live connection config (gitignored, credentials in plain text)
- **connections.template.json**: Example connection structure for documentation

### Configuration Examples
- **claude_desktop_config_example.json**: Example configuration for Claude Desktop
- **example-configuration-mcp.txt**: Additional config examples for various AI agents

### Documentation
- **README.md**: Comprehensive user documentation in English (complete rewrite in v2.1)
- **connections-README.md**: Web UI documentation in English
- **CHANGELOG.md**: Detailed version history with migration guides
- **CONTRIBUTING.md**: Contribution guidelines and coding standards

### Web UI (Optional but Powerful)
- **connections.html**: Standalone web UI with auto-save for editing connections.json visually
  - **Auto-save feature** with File System Access API (Chrome/Edge 86+)
  - **Drag & drop** connections between groups
  - **Smart group selector** with autocomplete
  - **Duplicate connections** functionality
  - **Persistent floating notifications** for save status
  - Complete English interface

## Critical Implementation Details

### SQL Injection Protection
⚠️ **SECURITY ISSUE**: The codebase has SQL injection vulnerabilities:
- `get_schema`: Directly interpolates `args.table` into query (line 341, 382)
- `get_indexes`: Directly interpolates `args.table` into query (line 382)
- `get_stored_procedure`: Directly interpolates `args.name` into query (line 460)

When fixing or extending this code, use parameterized queries via `request.input()`:
```javascript
// BAD (current code)
await pool.query(`SELECT * FROM ${args.table}`)

// GOOD
const request = pool.request()
request.input('tableName', sql.NVarChar, args.table)
await request.query('SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName')
```

### Execution Plan Implementation
The `get_execution_plan` tool has a specific pattern that must be maintained:
- Uses a single `request` object for the entire session (line 407)
- Must call `SET SHOWPLAN_XML ON` in a separate batch before the query
- Must call `SET SHOWPLAN_XML OFF` in a separate batch after
- Must handle cleanup in error cases to avoid leaving SHOWPLAN_XML enabled
- The XML plan is returned in the first recordset with varying column names (line 425-427)

### Connection Pool Lifecycle
When modifying connection management:
1. Always close pools before removing them from the Map
2. Handle close errors gracefully (may already be closed)
3. Clear the Map after closing all pools
4. The `reload_connections` pattern (lines 232-285) shows the correct approach

## Working with This Codebase

### Adding a New Tool
1. Add tool definition in `ListToolsRequestSchema` handler (lines 75-186)
2. Add case in `CallToolRequestSchema` switch statement (lines 309+)
3. Follow pattern: validate connection param, get metadata, get pool, execute operation
4. Include metadata in response for traceability
5. Wrap in try/catch for error handling
6. Update README.md with tool documentation (in English)

### Updating Web UI (connections.html)
1. **Auto-save**: Uses File System Access API (`showOpenFilePicker` with readwrite permission)
2. **Persistent notifications**: Function `showPersistentNotification(message, type)`
   - Types: 'success' (green), 'warning' (orange), 'info' (blue)
   - Bottom-right positioning, closeable with X button
3. **Drag & Drop**: Uses HTML5 Drag and Drop API
   - Cards have `draggable="true"`
   - Groups listen for dragover, drop, dragleave events
   - Update `connectionGroup` field on drop
4. **Smart Group Selector**: Uses `<input list>` + `<datalist>` for autocomplete
   - Update datalist when opening modal with existing groups
5. **All text must be in English**: Buttons, labels, notifications, placeholders, etc.

### Modifying Connection Config
When changing the connection configuration structure:
1. Update `connections.template.json` with new fields
2. Update `loadConnections()` if parsing logic changes
3. Update `getConnectionPool()` if mssql config changes
4. Update README.md connection configuration section
5. Consider migration path for existing users

### Error Handling Pattern
All tool handlers use this pattern:
```javascript
try {
  // Validate inputs
  if (!args.connection) throw new Error("Connection parameter is required")

  // Get connection config and create metadata
  const connConfig = connections.find(c => c.name === args.connection)
  if (!connConfig) throw new Error(`Connection '${args.connection}' not found`)

  // Execute operation
  const pool = await getConnectionPool(args.connection)
  // ... do work ...

  // Return with metadata
  return { content: [{ type: "text", text: JSON.stringify({ metadata, ...result }) }] }
} catch (error) {
  return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true
  }
}
```

## Version History Context

**Current Version: 2.1.0** (Released 2026-01-14)

### Major Changes Across Versions

**v2.1.0 (Latest)**:
- Added Web UI with **auto-save** functionality (File System Access API)
- Floating persistent notifications for save status (green=enabled, orange=manual)
- Auto-load connections.json from root directory
- Duplicate connection button
- Drag & drop connections between groups
- Smart connection group selector with autocomplete
- Complete English translation of all documentation
- Generalized for multiple AI agents (not just Claude Desktop)
- Reorganized Web UI button layout

**v2.0.0**:
- Single MCP entry, all connections in `connections.json`
- Added connection groups, descriptions, metadata in responses
- Hot-reload capability
- Fixed `get_execution_plan` bug

**v1.0.0**:
- Each connection was a separate entry in AI agent config with env vars

Breaking change from v1: All tools now require `connection` parameter to specify which database to use.

## Notes for Claude Code

- **Security First**: This codebase stores credentials in plain text. When discussing or extending, always mention security best practices.
- **English Documentation**: All user-facing docs are in English as of v2.1.0.
- **Multi-Agent Support**: Documentation references "AI agents" generically (Claude, ChatGPT, Copilot, Gemini) rather than only Claude Desktop.
- **No Test Suite**: Changes require manual testing through any MCP-compatible AI agent.
- **Connection Config**: Never commit actual `connections.json` with real credentials.
- **ES Modules**: Uses ES6 module syntax (`import`/`export`), not CommonJS.
- **Windows Paths**: Examples use Windows paths (C:\\); adjust for cross-platform scenarios.
- **Web UI**: Modern browser features (File System Access API) may not work in older browsers; fallback provided.
