# Web UI - SQL Server Connections Manager

Simple web interface to visually manage the `connections.json` file for MCP SQL Server. Works with any MCP-compatible AI agent (Claude Desktop, ChatGPT, GitHub Copilot, Google Gemini, etc.).

## 🎯 Features

- ✅ **100% Client-side (Frontend only)**: No server, no build, no dependencies
- ✅ **Visual editing** of connections.json file
- ✅ **Add, edit, duplicate and delete** connections easily
- ✅ **Auto-load** connections.json if found in root directory
- ✅ **Drag & drop** connections between groups
- ✅ **Smart connection group selector** with existing groups
- ✅ **Automatic grouping** by `connectionGroup`
- ✅ **Real-time form validation**
- ✅ **Modern design** with Tailwind CSS
- ✅ **Completely optional**: The MCP works without needing to use the UI

## 🚀 Usage

### Option 1: Open directly
1. Navigate to the folder: `C:\mcp-sqlserver\`
2. Double-click `connections.html`
3. It will open in your default browser

### Option 2: From browser
1. Open your browser
2. Drag the `connections.html` file to the browser window
3. Or use the path: `file:///C:/mcp-sqlserver/connections.html`

### Option 3: Auto-load (Recommended)
1. Place `connections.html` in the same directory as `connections.json`
2. Open `connections.html` in your browser
3. The file will be loaded automatically if found!

## 📋 Recommended Workflow

### To create/modify connections:

1. **Open the web UI**:
   - Double-click `connections.html`
   - If `connections.json` is in the same folder, it will load automatically
   - Otherwise, click "Load connections.json" and select your file

2. **Edit connections**:
   - Add new ones with "New Connection" button
   - Edit existing ones with the pencil icon
   - Duplicate connections with the copy icon (adds "-copy" suffix)
   - Delete with the trash icon
   - Drag & drop cards between groups to move them

3. **Download modified file**:
   - Click "Download connections.json"
   - File will be downloaded to your Downloads folder

4. **Replace original file**:
   - Copy the downloaded file
   - Replace the original in `C:\mcp-sqlserver\connections.json`

5. **Reload in your AI agent**:
   - Open your AI assistant (Claude, ChatGPT, Copilot, etc.)
   - Execute: "Reload SQL Server connections"
   - Done! Connections are updated

## 🔧 Functionalities

### Load File
- **With File System Access API** (Chrome 86+, Edge 86+):
  - Requests read/write permission
  - Enables auto-save feature
  - Shows floating green notification: "Auto-save enabled!"
  - All changes saved automatically
- **Fallback mode** (older browsers):
  - Traditional file picker
  - Shows floating orange warning: "Auto-save NOT enabled"
  - Requires manual download to save changes

### Auto-load
- Attempts to load `connections.json` from same directory on page load
- May fail due to CORS restrictions with `file://` protocol
- Use "Load connections.json" button for guaranteed loading

### New Connection
- Form with all necessary fields
- Real-time validation
- Prevents duplicate names
- Password show/hide toggle
- **Smart group selector**: Choose from existing groups or create new one

### Edit Connection
- Pre-loads existing data
- Maintains validations
- Updates in real-time

### Duplicate Connection (NEW!)
- Creates a copy of the connection
- Automatically adds "-copy" suffix to name
- If name exists, adds "-copy2", "-copy3", etc.
- Adds "(copy)" to description

### Drag & Drop (NEW!)
- Drag connection cards between groups
- Visual feedback when dragging over a group
- Automatically updates connectionGroup field
- Shows success notification after moving

### Delete Connection
- Confirmation before deleting
- Cannot undo (download to have backup)

### Download JSON
- Generates ready-to-use file
- JSON format with 2-space indentation
- Compatible with MCP

## 📁 Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | ✅ | Unique identifier (no spaces) |
| **Group** | Text + Datalist | ✅ | Group name (select existing or create new) |
| **Description** | Text | ✅ | Detailed description |
| **Server** | Text | ✅ | Hostname or IP (with \instance if applicable) |
| **Database** | Text | ✅ | Database name |
| **User** | Text | ✅ | SQL Server user |
| **Password** | Password | ✅ | Password |
| **Port** | Number | ✅ | SQL port (default: 1433) |
| **Encrypt** | Checkbox | ❌ | Encrypt connection |
| **Trust Certificate** | Checkbox | ❌ | Trust server certificate (default: true) |

## ⚠️ Important Considerations

### Security
- ⚠️ File contains passwords in plain text
- ✅ Only runs locally on your machine
- ✅ Doesn't send data to any server
- ✅ Doesn't require internet connection (except for Tailwind CDN)

### Limitations
- ❌ Doesn't test connections (only edits the file)
- ❌ Doesn't connect to MCP directly
- ❌ Requires manual file replacement
- ❌ No change history (make backups manually)

### Advantages
- ✅ No installation, no dependencies
- ✅ Works offline (with cached Tailwind)
- ✅ Cross-platform (any browser)
- ✅ Completely optional (MCP works without this)
- ✅ Auto-loads file if in same directory
- ✅ Drag & drop for easy organization
- ✅ Smart group management

## 🎨 Interface

### Main View
- List of connections grouped by group
- Cards with key information for each connection
- Action buttons (edit, duplicate, delete)
- **Drag cards** between groups to reorganize

### Edit Modal
- Complete form with all fields
- Real-time validation
- Show/hide password button
- **Smart group selector** with autocomplete
- Cancel or save changes

### Notifications

**Temporary notifications** (3 seconds, top-right):
- Success, error, or info messages
- Slide out animation

**Persistent notifications** (bottom-right, closeable):
- 🟢 **Green**: Auto-save enabled - changes saved automatically
- 🟠 **Orange**: Auto-save NOT enabled - remember to download manually
- Can be dismissed with X button

**Auto-save indicator** (header, 2 seconds):
- Green "Auto-saved" badge appears after each save
- Only visible when auto-save is active

## 💡 Tips

### Using Auto-save (Recommended)
1. Open `connections.html` in Chrome or Edge (86+)
2. Click "Load connections.json"
3. Grant read/write permission when prompted
4. ✅ See green notification: "Auto-save enabled!"
5. Make changes - they save automatically!
6. No need to download manually

### Without Auto-save (Fallback)
1. Open in any browser
2. Click "Load connections.json"
3. ⚠️ See orange warning about manual save
4. Make your changes
5. Click "Download connections.json"
6. Replace the original file

### Make Backup
Before making important changes:
```bash
# Backup copy
copy C:\mcp-sqlserver\connections.json C:\mcp-sqlserver\connections.backup.json
```

### Reload in Your AI Agent
After making changes:
```
"Reload SQL Server connections"
```

Or restart your AI agent completely (Claude Desktop, ChatGPT app, etc.).

### Organizing with Drag & Drop
1. Load your connections
2. Drag any connection card to another group section
3. Drop it there
4. Connection automatically moves to new group
5. Download to save changes

### Managing Groups Efficiently
When creating/editing a connection:
1. Click on "Connection Group" field
2. See dropdown with existing groups
3. Select one to avoid typos
4. Or type a new name to create a new group

## 🐛 Troubleshooting

### Error loading file
- **Cause**: Invalid JSON format
- **Solution**: Validate JSON at jsonlint.com

### Can't download
- **Cause**: No connections loaded
- **Solution**: Load a file or add at least one connection

### Changes don't reflect in AI agent
- **Cause**: File not replaced or not reloaded
- **Solution**:
  1. Verify you replaced the original file
  2. Execute "Reload connections" in your AI agent
  3. Or restart your AI agent completely

### Duplicate name
- **Cause**: A connection with that name already exists
- **Solution**: Use a different name or delete existing one

### Auto-load doesn't work
- **Cause**: CORS restrictions with `file://` protocol
- **Solution**: Use "Load connections.json" button (recommended) or serve via http server

### Auto-save not available
- **Cause**: Browser doesn't support File System Access API (need Chrome 86+/Edge 86+)
- **Solution**: Use fallback mode - make changes and download manually

### Changes not saved
- **Cause**: Auto-save not enabled (orange warning visible)
- **Solution**: Click "Download connections.json" after making changes

### Drag & drop doesn't work
- **Cause**: Browser doesn't support HTML5 drag & drop (very rare)
- **Solution**: Edit connection and change group manually

## 🔄 Complete Example Workflow

```bash
# 1. Open Web UI
file:///C:/mcp-sqlserver/connections.html

# 2. File auto-loads (if in same directory)
# or click "Load connections.json"

# 3. In Web UI
- Drag connections between groups to reorganize
- Click "New Connection"
- Select existing group from dropdown or type new one
- Fill form
- Click "Save"
- Click "Download connections.json"

# 4. Replace file
- Copy downloaded from Downloads
- Paste in C:\mcp-sqlserver\ (overwrite)

# 5. In your AI agent (Claude, ChatGPT, Copilot, etc.)
"Reload SQL Server connections"

# 6. Verify
"List all available connections"
```

## 📝 Notes

- Web UI is completely independent of MCP
- Doesn't modify file directly (for security)
- Requires manual steps but offers comfortable visual editing
- Ideal for managing multiple connections in an organized way
- Auto-load feature makes workflow much faster
- Drag & drop allows quick reorganization
- Smart group selector prevents typos

## 🚀 Changelog

### Version 2.1 (Latest - 2026-01-14)
- ✨ **New**: Auto-save with File System Access API
- ✨ **New**: Floating persistent notifications for save status
- ✨ **New**: Auto-load connections.json from root directory
- ✨ **New**: Duplicate connection button
- ✨ **New**: Drag & drop connections between groups
- ✨ **New**: Smart connection group selector with existing groups
- 🟢 **New**: Green notification when auto-save enabled
- 🟠 **New**: Orange warning when manual save required
- 🌐 **Improved**: Complete English translation
- 🎨 **Improved**: Visual feedback when dragging
- 🎨 **Improved**: Reorganized button layout (New Connection left, Load/Download right)
- 📝 **Improved**: Better UX for group management

### Version 2.0
- Initial release with basic functionality

## 🔮 Possible Future Improvements

If you want more automation in the future:
- Direct integration with MCP (would require backend)
- Auto-reload after saving
- Test connections before saving
- Change history
- Import/export complete groups
- Batch operations

But for now, this simple version perfectly fulfills the goal of visual editing without adding complexity to the project.

---

**Questions or problems?** Open an issue in the project repository.
