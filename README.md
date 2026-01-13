# Proofy Next.js ⚡

> Blockchain-based proof of creation platform - Next.js migration

**Proofy** allows creators to timestamp and protect their creations by anchoring file hashes to the **Polygon blockchain**. This is the Next.js version, migrated from Hono.js.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

- 🔗 **Blockchain Anchoring** on Polygon
- 🎵 **Music Rights Management**
- 🤖 **AI Context Tracking**
- 📜 **Certificate Generation** with QR codes
- 🎨 **Modern UI** with Framer Motion animations

---

## 🛠️ Tech Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4** + Framer Motion
- **Polygon Blockchain**
- **JWT Authentication**

---

## 📁 Structure

```
app/
├── api/           # API routes
├── dashboard/     # User dashboard
├── proof/[id]/    # Public verification
└── ...

components/
├── layout/        # Navbar, Footer
└── ui/            # UI components

lib/
├── db.ts          # Database (TODO)
└── blockchain.ts  # Blockchain (TODO)
```

---

## 🔧 Environment Variables

Create `.env.local`:

```env
JWT_SECRET=your-secret
POLYGON_PRIVATE_KEY=0x...
POLYGON_RPC_URL=https://polygon-rpc.com
```

---

## 🚧 TODO

- [ ] Fix Next.js 15+ API route signatures
- [ ] Implement database connection
- [ ] Complete blockchain integration
- [ ] Add form validation
- [ ] Add tests

---

## 🐛 Known Issues

1. **TypeScript**: API routes need Next.js 15+ param fix
2. **Database**: Not configured (returns null)
3. **Blockchain**: Mock responses only

---

## 🔗 Links

- **Original (Hono)**: [github.com/ArtysFactory/proofy](https://github.com/ArtysFactory/proofy)
- **Smart Contract**: `0x84250d37de73BE3C1BCbac62947350EA088F16B7` (Polygon)

---

**Made with ❤️ by ArtysFactory**
