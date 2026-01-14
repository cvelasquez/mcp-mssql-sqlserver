# MCP SQL Server

MCP (Model Context Protocol) server for interacting with multiple SQL Server instances from AI agents like Claude Desktop, ChatGPT, GitHub Copilot, Google Gemini, and other MCP-compatible AI assistants.

## Version 2.1 - Features

- **Centralized multiple connections**: All connections defined in `connections.json`
- **Client grouping**: Organize connections by `connectionGroup`
- **Detailed descriptions**: Each connection includes a description to identify purpose/location
- **Metadata in responses**: All operations include information about the connection used
- **Hot-reload**: Update connections without restarting your AI agent using `reload_connections`
- **Connection pooling**: Efficient reuse of active connections
- **Execution plans**: Detailed query performance analysis
- **Stored procedure analysis**: Retrieve and analyze SP definitions
- **Web UI with auto-save**: Visual management interface with automatic file saving

## Installation

```bash
cd C:\mcp-sqlserver
npm install
```

## Configuration

### 1. connections.json File

Define all your connections in the `connections.json` file:

```json
{
  "connections": [
    {
      "name": "production-main",
      "connectionGroup": "Production",
      "description": "Main production database",
      "server": "192.168.1.10\\SQLEXPRESS",
      "database": "ProductionDB",
      "user": "sa",
      "password": "your_password",
      "port": 1433,
      "encrypt": false,
      "trustServerCertificate": true
    },
    {
      "name": "staging-main",
      "connectionGroup": "Staging",
      "description": "Staging environment database",
      "server": "192.168.1.11",
      "database": "StagingDB",
      "user": "app_user",
      "password": "secure_password",
      "port": 1433,
      "encrypt": false,
      "trustServerCertificate": true
    }
  ]
}
```

**Configuration fields:**
- `name` (string, required): Unique connection identifier
- `connectionGroup` (string, required): Group it belongs to (e.g., client, project, environment)
- `description` (string, required): Detailed connection description
- `server` (string, required): SQL Server (can include instance name)
- `database` (string, required): Database name
- `user` (string, required): SQL Server user
- `password` (string, required): Password
- `port` (number, required): Port (usually 1433)
- `encrypt` (boolean, required): Encrypt the connection
- `trustServerCertificate` (boolean, required): Trust server certificate

### 2. MCP Configuration

Add the MCP server to your AI agent's configuration file:

**For Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"]
    }
  }
}
```

**For other MCP-compatible AI agents:**
Follow your specific agent's MCP configuration instructions and point to `index.js`.

**Important!** You only need one MCP entry. All connections are managed from `connections.json`.

### 3. Web UI (Optional) 🎨

Includes a simple web interface to visually edit the `connections.json` file without manual editing.

**Location:** `C:\mcp-sqlserver\connections.html`

**Features:**
- ✅ No installation, no build, no dependencies
- ✅ **Auto-load** connections.json if in the same folder
- ✅ Visual connection editing (add, edit, **duplicate**, delete)
- ✅ **Drag & drop** connections between groups
- ✅ **Smart group selector** (prevents typos)
- ✅ Automatic grouping by `connectionGroup`
- ✅ Real-time form validation
- ✅ **Auto-save** with File System Access API (Chrome/Edge 86+)
- ✅ Complete **English** interface
- ✅ Download modified connections.json file
- ✅ **Completely optional**: The MCP works perfectly without the UI

**Quick usage:**
1. Open `C:\mcp-sqlserver\connections.html` in your browser
2. **File auto-loads** if in the same folder, or click "Load connections.json"
3. Edit connections visually:
   - Duplicate connections with the copy button
   - Drag cards between groups to reorganize
   - Select existing groups or create new ones
4. With auto-save: Changes save automatically (Chrome/Edge 86+)
5. Without auto-save: Download the modified file and replace
6. In your AI agent: `"Reload SQL Server connections"`

**More information:** See [connections-README.md](connections-README.md)

---

## Available Tools

### 1. list_connections
Lists all available connections grouped by `connectionGroup`.

**Parameters:** None

**Example usage:**
```
List all available SQL Server connections
```

**Response:**
```
Available SQL Server Connections:

Production:
  - production-main
    Description: Main production database
    Server: 192.168.1.10\SQLEXPRESS
    Database: ProductionDB

Staging:
  - staging-main
    Description: Staging environment database
    Server: 192.168.1.11
    Database: StagingDB
```

---

### 2. reload_connections ⚡
Reloads the `connections.json` file without restarting your AI agent. Automatically closes obsolete connection pools and loads new configuration.

**Parameters:** None

**Example usage:**
```
Reload SQL Server connections
```

**Response:**
```json
{
  "success": true,
  "message": "Connections reloaded successfully",
  "totalConnections": 5,
  "closedPools": 2,
  "connectionNames": [
    "production-main",
    "staging-main",
    ...
  ]
}
```

**Use cases:**
- Add new connections without interrupting work
- Modify credentials or connection configuration
- Remove obsolete connections
- Update descriptions or connection groups

---

### 3. query
Executes a SQL query and returns results with connection metadata.

**Parameters:**
- `connection` (string, required): Connection name to use
- `sql` (string, required): SQL query to execute

**Example usage:**
```
Use the production-main connection and execute:
SELECT TOP 10 * FROM Employees WHERE Department = 'Sales'
```

**Response includes:**
- Connection metadata (group, description, server, database)
- Query result data
- Number of affected rows

---

### 4. get_schema
Gets complete schema of a table or entire database.

**Parameters:**
- `connection` (string, required): Connection name
- `table` (string, optional): Specific table name

**Example usage:**
```
Show me the complete schema of the Employees table in the production-main connection
```

**Returns:**
- Column names
- Data types
- Maximum character length
- Nullable status
- Default values

---

### 5. get_indexes
Gets detailed index information for a table.

**Parameters:**
- `connection` (string, required): Connection name
- `table` (string, required): Table name

**Example usage:**
```
What indexes does the Orders table have in staging-main?
```

**Returns:**
- Index name
- Type (CLUSTERED, NONCLUSTERED, etc.)
- Included columns
- INCLUDE columns

---

### 6. get_execution_plan
Gets XML execution plan of a query for performance analysis.

**Parameters:**
- `connection` (string, required): Connection name
- `sql` (string, required): SQL query to analyze

**Example usage:**
```
Analyze the execution plan of this query in production-main:
SELECT o.*, c.CustomerName
FROM Orders o
JOIN Customers c ON o.CustomerId = c.Id
WHERE o.OrderDate > '2024-01-01'
```

**Returns:**
- Execution plan in XML format
- Information about operations (scans, seeks, joins)
- Estimated costs
- Missing indexes suggested by SQL Server
- Performance warnings

**Analysis you can request:**
- Identify table scans and recommend indexes
- Detect expensive operations
- Suggest query optimizations
- Compare execution plans of different query versions

---

### 7. get_stored_procedure
Gets the complete definition of a stored procedure.

**Parameters:**
- `connection` (string, required): Connection name
- `name` (string, required): Stored procedure name

**Example usage:**
```
Use the production-main connection and show me the code for sp_CalculatePayroll
```

**Returns:**
- Complete stored procedure code
- Parameters
- Implemented logic

**Analysis you can request:**
- Review and suggest code improvements
- Identify performance issues
- Document procedure logic
- Detect possible bugs or code smells

---

## Response Format

All tools (except `list_connections` and `reload_connections`) include complete metadata in their responses:

```json
{
  "metadata": {
    "connection": "production-main",
    "connectionGroup": "Production",
    "description": "Main production database",
    "server": "192.168.1.10\\SQLEXPRESS",
    "database": "ProductionDB"
  },
  "data": [...],
  "rowsAffected": 10
}
```

This metadata allows you to:
- Confirm which connection was used
- Identify the group it belongs to
- Verify queried server and database
- Have complete context in long conversations

---

## Advanced Use Cases

### Example 1: Stored Procedure Analysis and Optimization
```
Use the production SQL Server MCP connection and analyze what improvements
we can make to the sp_CalculateOvertimeHours stored procedure. Review the
code, identify potential performance issues, and suggest optimizations.
```

### Example 2: Schema Comparison Between Environments
```
Compare the Employees table schema between the production-main and
staging-main connections. Identify differences in columns, data types, and indexes.
```

### Example 3: Query Performance Analysis
```
In the production-main connection, analyze the execution plan of this query:
SELECT * FROM Orders WHERE Status = 'Pending' AND OrderDate > '2024-01-01'

Identify table scans, suggest missing indexes, and optimizations.
```

### Example 4: Index Audit
```
Using the production-main connection, list all tables that have no indexes
or only have a clustered index. Suggest what additional indexes we should create.
```

### Example 5: Complete Workflow - Add a Connection
```
1. [Edit connections.json and add the new connection]
2. "Reload SQL Server connections"
3. "List available connections"
4. "Use the new connection and execute SELECT TOP 5 * FROM SystemInfo"
```

---

## Connection Management

### Add a New Connection (Recommended Workflow)

1. Edit the `connections.json` file
2. Add the new connection to the array:

```json
{
  "name": "dev-environment",
  "connectionGroup": "Development",
  "description": "Development environment - Testing database",
  "server": "localhost",
  "database": "DevDB",
  "user": "dev_user",
  "password": "dev_password",
  "port": 1433,
  "encrypt": false,
  "trustServerCertificate": true
}
```

3. In your AI agent, execute: `"Reload SQL Server connections"`
4. Verify with: `"List all available connections"`
5. Done! The new connection is immediately available

### Modify an Existing Connection

1. Edit the necessary fields in `connections.json`
2. Execute in your AI agent: `"Reload SQL Server connections"`
3. Active connections will close and reload automatically

### Delete a Connection

1. Remove the entry from the array in `connections.json`
2. Execute in your AI agent: `"Reload SQL Server connections"`
3. The connection pool will close automatically

---

## Troubleshooting

### Error: Connection 'xxx' not found
**Cause:** Connection name doesn't exist in `connections.json` or is misspelled.

**Solution:**
1. Execute `"List all available connections"` to see exact names
2. Verify name in `connections.json` matches exactly (case-sensitive)
3. If you just added the connection, execute `"Reload connections"`

### SQL Server Connection Error
**Possible causes:**
- Incorrect credentials
- Server or instance misconfigured
- Incorrect port
- Firewall blocking connection
- SQL Server doesn't allow remote connections

**Diagnosis:**
1. Verify credentials (server, user, password, database)
2. Test connectivity: `ping [server]` and `telnet [server] [port]`
3. Verify SQL Server allows SQL Server authentication (not just Windows)
4. Check SQL Server logs for more details
5. Verify user has permissions on the database

### AI Agent Doesn't Find MCP
**Solution:**
1. Verify absolute path in your agent's config file
2. Ensure `node` is installed and in your PATH
3. Restart your AI agent completely (close all windows)
4. Verify `index.js` file exists at the specified path
5. Test manual execution: `node C:\mcp-sqlserver\index.js`

### Error Reloading Connections
**Cause:** `connections.json` file with invalid JSON format.

**Solution:**
1. Validate JSON at https://jsonlint.com/
2. Verify all commas are correct
3. Verify no missing or extra braces `{}`
4. Verify all strings are in double quotes `"`

---

## Security

⚠️ **Important**: The `connections.json` file contains passwords in plain text.

### Security Recommendations:

1. **Version control:**
   - ❌ **DO NOT upload** `connections.json` to public repositories
   - ✅ Add `connections.json` to your `.gitignore`
   - ✅ Use a `connections.template.json` file with example values

2. **File permissions:**
   - Restrict read permissions to necessary user only
   - Windows: `icacls connections.json /inheritance:r /grant:r "%USERNAME%:F"`
   - Linux/Mac: `chmod 600 connections.json`

3. **Credentials:**
   - Use SQL Server users with minimum necessary permissions
   - Don't use `sa` accounts in production
   - Consider using Windows integrated authentication when possible
   - Rotate passwords periodically

4. **Production:**
   - Consider using Azure Key Vault or similar for secrets
   - Implement environment variables instead of plain text
   - Use encrypted connections (`encrypt: true`)

### Example .gitignore

```gitignore
# MCP SQL Server
connections.json
node_modules/
*.log
```

---

## Migration from Version 1.0

If you were using the previous version with multiple entries in your AI agent's config file:

### Step 1: Create connections.json
Convert your connections from old format:

**Old format (agent config):**
```json
{
  "mcpServers": {
    "sqlserver-prod": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"],
      "env": {
        "SQL_SERVER": "192.168.1.10\\SQLEXPRESS",
        "SQL_DATABASE": "ProductionDB",
        ...
      }
    }
  }
}
```

**New format (connections.json):**
```json
{
  "connections": [
    {
      "name": "production-main",
      "connectionGroup": "Production",
      "description": "Main production database",
      "server": "192.168.1.10\\SQLEXPRESS",
      "database": "ProductionDB",
      ...
    }
  ]
}
```

### Step 2: Update Agent Configuration
Replace all `sqlserver-xxx` entries with a single entry:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"]
    }
  }
}
```

### Step 3: Restart Your AI Agent
Completely close and reopen your AI agent.

### Step 4: Verify
Execute: `"List all available SQL Server connections"`

---

## Development and Testing

### Project Structure

```
mcp-sqlserver/
├── index.js                      # Main MCP server
├── connections.json              # Connection configuration
├── connections.template.json     # Example template
├── connections.html              # Web UI with auto-save
├── connections-README.md         # Web UI documentation
├── package.json                  # npm dependencies
├── README.md                     # This file
├── CHANGELOG.md                  # Change history
├── CLAUDE.md                     # Claude Code guidance
└── .gitignore                    # Ignored files
```

### Manual Testing

```bash
# Verify syntax
node index.js

# View logs in Claude Desktop
# Windows: %APPDATA%\Claude\logs
# Mac: ~/Library/Logs/Claude
# Linux: ~/.config/Claude/logs
```

### Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Roadmap

### Version 2.2 (Planned)
- [ ] Windows integrated authentication support
- [ ] Export query results to CSV/Excel
- [ ] Automatic database schema backup
- [ ] Command to compare schemas between connections
- [ ] Explicit transaction support
- [ ] Query execution history

### Version 3.0 (Future)
- [ ] Azure SQL Database support
- [ ] Azure Key Vault integration for credentials
- [ ] Usage metrics and monitoring
- [ ] Support for other database types (PostgreSQL, MySQL)
- [ ] Query result caching
- [ ] Custom plugin system

---

## License

ISC

---

## Author

Christian V. - @cvelasquez

### Contact and Support

- **Issues:** [GitHub Issues](https://github.com/cvelasquez/mcp-sqlserver/issues)
- **Documentation:** [Project Wiki](https://github.com/cvelasquez/mcp-sqlserver/wiki)

---

## Changelog

### v2.1.0 (2026-01-14)
- ✨ **NEW:** Web UI with auto-save functionality (File System Access API)
- ✨ **NEW:** Floating persistent notifications for save status
- ✨ **NEW:** Auto-load connections.json from root directory
- ✨ **NEW:** Duplicate connection button
- ✨ **NEW:** Drag & drop connections between groups
- ✨ **NEW:** Smart connection group selector with autocomplete
- 🟢 **NEW:** Green notification when auto-save enabled
- 🟠 **NEW:** Orange warning when manual save required
- 🌐 **IMPROVED:** Complete English translation
- 🎨 **IMPROVED:** Visual feedback when dragging
- 🎨 **IMPROVED:** Reorganized button layout
- 📝 **IMPROVED:** Better UX for group management
- 🔧 **IMPROVED:** Generalized for multiple AI agents (Claude, ChatGPT, Gemini, Copilot, etc.)

### v2.0.0 (2026-01-01)
- ✨ **NEW:** `reload_connections` command for hot-reload without restart
- ✨ **NEW:** `connectionGroup` field for organizing connections
- ✨ **NEW:** `description` field for each connection
- ✨ **NEW:** `get_execution_plan` command for performance analysis
- ✨ **NEW:** Metadata included in all responses
- 🔧 Centralized `connections.json` file
- 🔧 Optimized connection pooling
- 📝 Complete documentation update

### v1.0.0 (2025-12-15)
- 🎉 Initial release
- ✅ Basic commands: query, get_schema, get_indexes, get_stored_procedure
- ✅ Multiple connection support

---

## Compatible AI Agents

This MCP server works with any MCP-compatible AI agent, including:
- 🤖 **Claude Desktop** (Anthropic)
- 🤖 **ChatGPT** with MCP support
- 🤖 **GitHub Copilot** with MCP integration
- 🤖 **Google Gemini** with MCP support
- 🤖 Any other AI agent that implements the Model Context Protocol

**Ready to start?** 🚀

1. Configure your `connections.json`
2. Update your AI agent's MCP configuration
3. Restart your AI agent
4. Execute: `"List all available SQL Server connections"`
5. Enjoy working with SQL Server from your AI assistant!
