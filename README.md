<img src="https://wisk.cc/a7/forget/report.png" alt="Wisk Editor Interface" style="border: 1px solid #ccc; border-radius: 7px;">

# Wisk

A plugin-based document editor built with vanilla JavaScript and Web Components. Works offline, syncs across devices, and supports real-time collaboration.

## Quick Links
- **Try Wisk**: Start using Wisk immediately at [app.wisk.cc](https://app.wisk.cc)
- **Documentation**: Full documentation available at [wisk.cc/docs](https://wisk.cc/docs)
- **Website**: Visit [wisk.cc](https://wisk.cc) for more information


## Overview

Wisk is an open-source document editor focusing on extensibility and performance. The frontend is built without frameworks or build tools, using modern Web APIs and standards.

### Core Functionality
- 📝 Block-based editor with real-time rendering
- 🎨 Customizable themes and styles
- 🔌 Extensible plugin system
- 💾 Offline-first with automatic saving
- 📱 PWA support for mobile and desktop

### Cloud Features (with Wisk backend)
- 🤝 Real-time collaboration
- 🔄 Cross-device synchronization
- 📚 Citation management
- 🤖 AI-powered assistance

## Technical Stack

- Pure JavaScript, zero dependencies (~25k LOC)
- Web Components (lit-element)
- IndexedDB for offline storage
- Service Workers for PWA functionality
- No build tooling required

## Quick Start

```bash
git clone https://github.com/yourusername/wisk.git
cd wisk
python -m http.server 8000
# Visit http://localhost:8000
```

## Architecture

The frontend is standalone and fully functional without external services. Key design principles:
- Pure vanilla JavaScript (~25k lines)
- Web Components using lit-element
- IndexedDB for offline storage
- Service Workers for PWA functionality
- Zero build tooling required

The frontend is open source and fully functional standalone, but requires Wisk backend services for advanced features like real-time collaboration, sync, citation management, and AI capabilities. The backend services are not open source and some features require a subscription to use.

## License

Licensed under the Functional Source License (FSL), Version 1.1, with Apache License Version 2.0 as the Future License. See [LICENSE.md](LICENSE.md).

## Contributing

> [!NOTE]
> We're working on improving the mobile experience! Our current drag-and-drop and click interactions aren't optimal for touch devices. If you have experience with mobile web development and accessibility, we'd love your contributions.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---
Built with ❤️ by [Cynthwave](https://cynthwave.com) • Contact: hey@cynthwave.com
