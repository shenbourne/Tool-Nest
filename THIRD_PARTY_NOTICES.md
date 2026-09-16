# Third Party Notices

ToolNest incorporates code and dependencies from the following projects and packages.

## Upstream Projects

### it-tools
- **Repository**: https://github.com/CorentinTh/it-tools
- **License**: GPL-3.0
- **Usage**: Core tool implementations (crypto, converter, web, network, text tools)
- **Copyright**: Copyright (c) 2022 Corentin Thomasset

### 1Panel-Tools
- **Repository**: https://github.com/1Panel-dev/1Panel-Tools (it-tools fork)
- **License**: GPL-3.0
- **Usage**: Docker Compose to 1Panel AppStore tool

### omni-tools
- **License**: MIT
- **Usage**: String, list, CSV, JSON, XML, time tools; image/PDF tools (rewritten to Vue)

### MyIP
- **Repository**: https://github.com/jason5ng32/MyIP
- **License**: MIT
- **Usage**: Network testing tools (connectivity, WebRTC, speed test, DNS, etc.)

---

## Key Dependencies

### Frontend (apps/web)

| Package | License | Purpose |
|---------|---------|---------|
| vue | MIT | Frontend framework |
| vue-router | MIT | Client-side routing |
| pinia | MIT | State management |
| vue-i18n | MIT | Internationalization |
| naive-ui | MIT | UI component library |
| unocss | MIT | Utility-first CSS |
| fuse.js | Apache-2.0 | Fuzzy search |
| crypto-js | MIT | Encryption algorithms |
| node-forge | BSD-3-Clause | RSA key generation |
| bcryptjs | MIT | Bcrypt hashing |
| uuid | MIT | UUID generation |
| ulid | MIT | ULID generation |
| bip39 | ISC | Mnemonic generation |
| pdf-lib | MIT | PDF manipulation |
| jspdf | MIT | PDF generation |
| browser-image-compression | MIT | Image compression |

### Backend (apps/server)

| Package | License | Purpose |
|---------|---------|---------|
| express | MIT | Web framework |
| helmet | MIT | Security headers |
| cors | MIT | Cross-origin support |
| express-rate-limit | MIT | Rate limiting |
| js-yaml | MIT | YAML parsing |

### Shared (packages/shared)

| Package | License | Purpose |
|---------|---------|---------|
| typescript | Apache-2.0 | Type system |

---

## License Compatibility

- **GPL-3.0** (it-tools, 1Panel-Tools): The main project license. All derivative works must also be GPL-3.0.
- **MIT** (omni-tools, MyIP, most npm packages): Compatible with GPL-3.0. MIT-licensed code can be included in GPL projects.
- **BSD-3-Clause** (node-forge): Compatible with GPL-3.0.
- **Apache-2.0** (fuse.js, typescript): Compatible with GPL-3.0.
- **ISC** (bip39): Compatible with GPL-3.0.

All third-party licenses have been reviewed and are compatible with the GPL-3.0 license under which ToolNest is distributed.
