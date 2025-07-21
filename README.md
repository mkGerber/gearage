# Gearage - Car Part Inventory & Mod Tracker

> **Notion, but for car builds** 🚗🔧

Gearage is a comprehensive car modification tracking application that helps car enthusiasts document every part, cost, and modification they've made to their vehicles. Think of it as a professional build log that tracks costs, provides analytics, and helps you maintain a complete history of your car modifications.

## ✨ Features

### 🚗 Vehicle Management

- Add and manage multiple vehicles
- Track vehicle details (make, model, year, VIN, mileage, color)
- Upload vehicle photos
- View total spending per vehicle

### 🔧 Part & Modification Tracking

- Comprehensive part details (name, brand, part number, cost)
- Installation costs and dates
- Mileage tracking at installation
- Multiple photo uploads
- External links to parts/products
- Warranty information
- Notes and descriptions

### 📊 Analytics & Insights

- Total spending overview
- Spending by category (engine, suspension, wheels, etc.)
- Monthly spending trends
- Average part costs
- Category breakdowns
- Vehicle comparison charts

### 💰 Cost Management

- Track part costs vs installation costs
- Total cost calculations
- Spending analytics
- Cost breakdowns by vehicle and category

### 📱 Modern UI/UX

- Beautiful, responsive design
- Mobile-friendly interface
- Intuitive navigation
- Real-time updates
- Toast notifications

### 🔐 Freemium Model

- **Free Plan**: 1 vehicle, basic features
- **Premium Plan** ($4.99/month or $39.99/year):
  - Unlimited vehicles
  - Cloud sync across devices
  - PDF export functionality
  - Advanced analytics
  - Priority support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gearage
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
gearage/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── store/              # Redux store and slices
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🎯 Key Features Explained

### Vehicle Management

- Add vehicles with comprehensive details
- Track multiple vehicles (unlimited with premium)
- Vehicle-specific analytics and spending

### Part Tracking

- 13 different part categories (engine, suspension, wheels, etc.)
- Cost breakdown (part cost + installation)
- Photo documentation
- External links to products
- Warranty tracking

### Analytics Dashboard

- Visual charts and graphs
- Spending trends over time
- Category-based analysis
- Vehicle comparison

### Export & Sharing

- CSV export (free)
- PDF export (premium)
- Professional build reports
- Shareable vehicle profiles

## 💡 Use Cases

### For Car Enthusiasts

- Document your build process
- Track spending and budget
- Maintain service history
- Share builds with the community

### For Car Dealers

- Document modifications for resale
- Provide detailed build sheets
- Track vehicle value additions
- Professional presentation

### For Mechanics

- Track work performed
- Maintain customer records
- Document part installations
- Professional reporting

## 🔮 Future Features

- [ ] Mobile app (React Native)
- [ ] Social features (share builds)
- [ ] Integration with parts suppliers
- [ ] Maintenance scheduling
- [ ] Value depreciation tracking
- [ ] Insurance documentation
- [ ] Community marketplace
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@gearage.app
- **Documentation**: [docs.gearage.app](https://docs.gearage.app)
- **Community**: [community.gearage.app](https://community.gearage.app)

## 🙏 Acknowledgments

- Built with ❤️ for the car community
- Inspired by car enthusiasts who love documenting their builds
- Special thanks to all the beta testers and early adopters

---

**Gearage** - Track your car builds like a pro! 🏁
