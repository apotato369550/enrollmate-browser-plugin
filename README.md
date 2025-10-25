# EnrollMate Browser Extension

A Chrome/Firefox browser extension that automatically extracts course schedules from your university's course registration system and syncs them with EnrollMate for smart scheduling.

## Features

- **One-click course extraction** - Scrape all courses from your university's registration page
- **Intelligent data parsing** - Automatically parses times, enrollment numbers, and instructor information
- **Multiple university support** - Works with Canvas, Banner, and other course registration systems
- **Automatic deduplication** - Removes duplicate courses automatically
- **Secure authentication** - Uses EnrollMate authentication with secure token storage
- **Batch import** - Send all extracted courses to EnrollMate at once
- **Error recovery** - Graceful error handling with user-friendly messages

## Quick Start

### Installation

1. **Clone or download** this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `browser-extension` folder
6. The EnrollMate icon will appear in your toolbar

### First Use

1. Navigate to your university's course registration page
2. Click the EnrollMate extension icon
3. Click "🚀 Extract Courses"
4. Review the extracted courses
5. Click "Continue to EnrollMate"
6. Log in with your EnrollMate account
7. Select a semester and import!

## Project Structure

```
browser-extension/
├── manifest.json              # Chrome extension configuration
├── popup.html                 # Extension popup interface
├── popup.css                  # Styling
├── popup.js                   # Popup logic
├── content-script.js          # DOM scraping logic
├── background.js              # Service worker for API calls
├── utils/
│   ├── config.js             # Configuration constants
│   ├── storage.js            # Local storage helpers
│   └── dataParser.js         # Data parsing utilities
└── assets/
    └── icon-placeholder.svg  # Extension icon
```

## Documentation

- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Complete setup, testing, and troubleshooting guide
- **[PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)** - Comprehensive implementation guide for all 6 phases

## Testing

The extension comes with sample HTML files in the `example_data/` folder for testing:

```bash
# Open an example page and test extraction
chrome://extensions -> Load unpacked -> browser-extension
# Navigate to example_data/example_1.html
# Click extension icon and test extraction
```

See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed testing steps.

## Configuration

Before first use, update `browser-extension/utils/config.js`:

```javascript
export const ENROLLMATE_API_URL = 'https://your-enrollmate-api.com';
```

## Supported Universities

The extension currently supports:
- **Canvas** (Instructure-based systems)
- **Banner** (Ellucian Banner systems)
- **Generic HTML table layouts** (auto-detection)

Adding support for more universities is straightforward - see [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) Phase 5.

## Development

### Tech Stack

- **Frontend:** Vanilla JavaScript (no build tools required)
- **UI:** Custom CSS with Tailwind-like styling
- **Storage:** Chrome Storage API
- **Architecture:** Content script + background service worker pattern

### Architecture

- **Content Script** (`content-script.js`) - Runs on university pages to scrape course data
- **Background Worker** (`background.js`) - Handles authentication and API calls
- **Popup UI** (`popup.js`) - User interface for extraction and authentication

### Data Flow

1. User clicks extension icon → Popup opens
2. User clicks "Extract Courses" → Content script scrapes DOM
3. Course data returned to popup → Data parsed and validated
4. User clicks "Continue" → Authentication popup shown
5. Credentials sent to background worker → API authenticates
6. User selects semester → Courses sent to EnrollMate API
7. Success response → Popup closes

## Troubleshooting

### Extension won't load
- Check `chrome://extensions/` for errors
- Verify `manifest.json` is valid JSON
- Clear cache and reload: Remove extension, reload, reinstall

### No courses extracted
- Verify you're on a course listing page
- Check DevTools Console (F12) for errors
- Try different example pages from `example_data/`

### API errors
- Verify `ENROLLMATE_API_URL` is correct in `config.js`
- Check your EnrollMate backend is running
- Look at Network tab in DevTools to see API responses

See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for more troubleshooting.

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Extension fundamentals & setup |
| **Phase 2** | ✅ Complete | Course scraping & data extraction utilities |
| **Phase 3** | ✅ Complete | Popup UI & user interaction |
| **Phase 4** | 🔄 Next | Backend API integration |
| **Phase 5** | 📋 Planned | Advanced features & polish |
| **Phase 6** | 📋 Planned | Testing & deployment |

## Next Steps

1. **Test the extension** using the [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
2. **Configure your EnrollMate API URL** in `utils/config.js`
3. **Implement Phase 4** - Backend API endpoint for course import
4. **Add university support** - Customize selectors for your university's system

## Known Limitations

- Content scripts can't run on certain restricted pages (Chrome Store, Gmail, etc.)
- Some universities may require authentication before accessing course listings
- Very large course lists (500+ courses) may take longer to process
- University system changes may require selector updates

## Security & Privacy

✅ **What we DO store:**
- JWT authentication token (cleared on logout)
- User email address

❌ **What we DON'T store:**
- Passwords (never saved locally)
- University login credentials
- Course data (stored only in EnrollMate)
- Browsing history

## License

MIT License - See LICENSE file for details

## Support

For issues or feature requests:
1. Check [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) troubleshooting section
2. Check existing GitHub issues
3. Open a new issue with:
   - Chrome version
   - University system being used
   - Steps to reproduce
   - Browser console errors (F12)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly using the testing guide
4. Submit a pull request with description of changes

---

**Happy course scheduling! 📚✨**
