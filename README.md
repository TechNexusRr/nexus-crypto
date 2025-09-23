# Nexus Crypto

A production-grade **offline-first PWA** built with Next.js for currency conversion and cryptocurrency P&L calculations.

## 🚀 Features

### 💱 Currency Converter
- **Real-time exchange rates** from reliable API sources
- **Offline support** with cached rates
- **Smart connectivity detection** (server vs network status)
- **Drag & drop reordering** of currencies with persistence
- **Favorites system** for quick access to preferred currencies
- **Mobile-optimized** input with numeric keyboard
- **Bidirectional editing** - edit any currency to update all others

### 📊 Crypto P&L Calculator
- **Ethereum (ETH) trading calculations**
- **Buy/sell fees** (0.1% each) included
- **Break-even analysis** with dynamic thresholds
- **Excel-like calculations** with precision controls
- **Real-time profit/loss indicators**

### 🌐 PWA Features
- **Offline-first architecture** using Serwist service worker
- **Installable** on desktop and mobile devices
- **Background sync** for rate updates
- **Progressive enhancement** with graceful degradation

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **PWA**: Serwist (next-generation service worker)
- **State Management**: React hooks + localStorage
- **Runtime**: Node.js (development) / Any hosting platform

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nexus-crypto.git
   cd nexus-crypto
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Exchange rates API configuration
NEXT_PUBLIC_RATES_API_BASE=https://api.exchangerate-api.com/v4
NEXT_PUBLIC_RATES_API_PATH=/latest
NEXT_PUBLIC_RATES_API_BASE_CURRENCY=USD
NEXT_PUBLIC_RATES_API_TTL_MIN=45

# Feature flags
NEXT_PUBLIC_ENABLE_CRYPTO_ETH=true
```

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler check

## 🌍 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Vercel
1. Import project from GitHub
2. Configure environment variables
3. Deploy automatically

### Self-hosted
1. Build the project: `pnpm build`
2. Start with: `pnpm start`
3. Ensure Node.js 18+ is installed on server

## 📱 PWA Installation

1. **Desktop**: Visit the site and click the install button in the address bar
2. **Mobile**: Use "Add to Home Screen" from browser menu
3. **Offline usage**: Works without internet after first visit

## 🎯 Currency Support

Currently supports 12 major currencies:
- USD (US Dollar) - Base currency
- EUR (Euro)
- GBP (British Pound)
- ARS (Argentine Peso)
- BRL (Brazilian Real)
- MXN (Mexican Peso)
- UYU (Uruguayan Peso)
- DOP (Dominican Peso)
- JPY (Japanese Yen)
- CNY (Chinese Yuan)
- INR (Indian Rupee)
- AUD (Australian Dollar)

## 🔒 Privacy & Offline

- **No tracking** or analytics
- **Local storage only** for user preferences
- **Cached rates** work offline indefinitely
- **No server dependencies** after first load

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Exchange rates provided by [ExchangeRate-API](https://exchangerate-api.com/)
- Built with [Next.js](https://nextjs.org/) and [Serwist](https://serwist.pages.dev/)
- Icons and design inspiration from modern financial apps