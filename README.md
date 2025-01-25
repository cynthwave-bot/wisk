![Wisk](https://wisk.cc/a7/forget/img.png)

# Wisk

A plugin-based document editor built with vanilla JavaScript and Web Components. Works offline, syncs across devices, and supports real-time collaboration.

## Quick Links

- **Try Wisk**: Start using Wisk immediately at [app.wisk.cc](https://app.wisk.cc)
- **Documentation**: Full documentation available at [wisk.cc/docs](https://wisk.cc/docs)
- **Website**: Visit [wisk.cc](https://wisk.cc) for more information

## Overview

Wisk is an open-source document editor focusing on extensibility and performance. The frontend is built without frameworks or build tools, using modern Web APIs and standards.

The frontend is open source and fully functional standalone, but requires Wisk backend services for advanced features like real-time collaboration, sync, citation management, and AI capabilities. The backend services are not open source and some features require a subscription to use.

### Core Functionality

- Block-based editor with real-time rendering
- Extensible plugin system
- Customizable themes and styles
- Offline-first with automatic saving
- PWA support for mobile and desktop
- Templates support for quick start
- Citation Manager for academic writing

### Cloud Features (with Wisk backend)

- AI assistance for writing
- Real-time collaboration
- Cross-device synchronization
- One click citations
- Publishing and sharing
- Export to various formats (PDF, DOCX, etc.) with latex templates

## Quick Start

```bash
git clone https://github.com/yourusername/wisk.git
cd wisk
python -m http.server 8000
# Visit http://localhost:8000
```

## License

Licensed under the Functional Source License (FSL), Version 1.1, with Apache License Version 2.0 as the Future License. See [LICENSE.md](LICENSE.md).

## Contributing

> [!NOTE]
> We're working on improving the mobile experience! Our current drag-and-drop and click interactions aren't optimal for touch devices. If you have experience with mobile web development and accessibility, we'd love your contributions.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---

Built with ❤️ by [Cynthwave](https://cynthwave.com) • Contact: hey@cynthwave.com
