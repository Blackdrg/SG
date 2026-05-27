# Icon Audit Report

## Summary
Found **90+ emoji instances** across 5 apps. No SVG icons, font-awesome, or material-icons libraries detected. All icons are currently using Unicode emojis that need replacement with consistent design system icons.

---

## Style Rules (Visual Identity)

### Icon Stroke
- **2px stroke** for all icons (default)
- Rounded edges with consistent geometry
- Soft rounded corners for premium food-tech feel

### Sizes
| Size | Usage | Token |
|------|-------|-------|
| 12px | Tiny labels | `--icon-size-tiny` |
| 16px | Inline UI elements | `--icon-size-inline` |
| 20px | Normal buttons | `--icon-size-normal` |
| 24px | Navigation tabs | `--icon-size-nav` |
| 32px | Hero sections | `--icon-size-hero` |
| 48–64px | Empty states | `--icon-size-empty` |

### Color Behavior (Semantic Tokens)
Never hardcode colors. Use:

| Token | Usage |
|-------|-------|
| `--icon-primary` | Primary actions, active navigation |
| `--icon-secondary` | Secondary actions |
| `--icon-muted` | Disabled/inactive states |
| `--icon-danger` | Error, destructive actions |
| `--icon-success` | Success, completed states |
| `--icon-warning` | Warnings, alerts |

---

## Customer Mobile App (`apps/customer-mobile`)

### App.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🏠 | Tab bar - Home | Home Icon | High | ❌ TODO |
| 🔍 | Tab bar - Search | Search Icon | High | ❌ TODO |
| 🛒 | Tab bar - Cart | ShoppingCart Icon | High | ❌ TODO |
| 👤 | Tab bar - Profile | User Icon | High | ❌ TODO |

### HomeScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ⚠️ | Error state | AlertCircle Icon | Medium | ❌ TODO |
| 🔍 | Search bar | Search Icon | High | ❌ TODO |
| 👤 | Header profile button | User Icon | High | ❌ TODO |
| ⭐ | Restaurant rating | Star Icon | High | ❌ TODO |
| 📍 | Restaurant distance | MapPin Icon | High | ❌ TODO |

### ProfileScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 💰 | Menu - Wallet | Wallet Icon | High | ❌ TODO |
| 📦 | Menu - Orders | Package Icon | High | ❌ TODO |
| 📍 | Menu - Addresses | MapPin Icon | High | ❌ TODO |
| 💳 | Menu - Payment | CreditCard Icon | High | ❌ TODO |
| 🔔 | Menu - Notifications | Bell Icon | High | ❌ TODO |
| ❓ | Menu - Support | HelpCircle Icon | Medium | ❌ TODO |
| 👤 | Profile avatar placeholder | User Icon | High | ❌ TODO |

### CartScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ⚠️ | Error state | AlertCircle Icon | Medium | ❌ TODO |
| 🛒 | Empty cart icon | ShoppingCart Icon | High | ❌ TODO |
| ✕ | Remove item button | X Icon | Medium | ❌ TODO |

### RestaurantScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ⚠️ | Error state | AlertCircle Icon | Medium | ❌ TODO |
| ⭐ | Restaurant rating | Star Icon | High | ❌ TODO |

### CheckoutScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ← | Back button | ArrowLeft Icon | High | ❌ TODO |
| 💳 | Card payment | CreditCard Icon | High | ❌ TODO |
| 📱 | UPI payment | Smartphone Icon | Medium | ❌ TODO |
| 💵 | Cash payment | Banknote Icon | Medium | ❌ TODO |

### TrackingScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ← | Back button | ArrowLeft Icon | High | ❌ TODO |
| 📶 | Error state | Wifi Icon | Medium | ❌ TODO |
| 🗺️ | Map preview | Map Icon | Medium | ❌ TODO |
| 👨‍💼 | Driver avatar | User Icon | High | ❌ TODO |
| 📞 | Driver phone | Phone Icon | High | ❌ TODO |
| 💬 | Support button | MessageCircle Icon | Medium | ❌ TODO |
| 🎉 | Delivered state | CheckCircle Icon | High | ❌ TODO |

### OrderDetailsScreen.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ← | Back button | ArrowLeft Icon | High | ❌ TODO |

---

## Customer Web App (`apps/customer-web/src/pages`)

### index.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🍔 | Category - Burgers | Burger Icon | High | ❌ TODO |
| 🍕 | Category - Pizza | Pizza Icon | High | ❌ TODO |
| 🥤 | Category - Drinks | Cup Icon | Medium | ❌ TODO |
| 🍰 | Category - Dessert | Dessert Icon | Medium | ❌ TODO |
| 🥗 | Category - Healthy | Salad Icon | Medium | ❌ TODO |
| 👋 | Greeting header | Hand Icon | Low | ❌ TODO |
| 🔔 | Notification button | Bell Icon | High | ❌ TODO |
| 🔍 | Search icon | Search Icon | High | ❌ TODO |
| 🎉 | Promo banner | Gift Icon | Medium | ❌ TODO |
| 🍽️ | Restaurant card | Utensils Icon | High | ❌ TODO |
| ⭐ | Rating display | Star Icon | High | ❌ TODO |
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 📦 | Bottom nav - Orders | Package Icon | High | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### restaurant.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🍔 | Menu item - Whopper | Burger Icon | High | ❌ TODO |
| 🍟 | Menu item - Chicken Fries | Fries Icon | Medium | ❌ TODO |
| 🥤 | Menu item - Coke | Cup Icon | Medium | ❌ TODO |
| 🍔 | Menu item - Double Cheese | Burger Icon | High | ❌ TODO |
| 🍔 | Menu item - Veg Burger | Burger Icon | High | ❌ TODO |
| 🥤 | Menu item - Large Coke | Cup Icon | Medium | ❌ TODO |
| 🍔 | Restaurant header | Burger Icon | High | ❌ TODO |
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 📋 | Bottom nav - Menu | Menu Icon | Medium | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### menu.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🍔 | Classic Burger | Burger Icon | High | ❌ TODO |
| 🍔 | Cheese Burger | Burger Icon | High | ❌ TODO |
| 🍔 | Veggie Burger | Burger Icon | High | ❌ TODO |
| 🍕 | Margherita Pizza | Pizza Icon | High | ❌ TODO |
| 🍕 | Pepperoni Pizza | Pizza Icon | High | ❌ TODO |
| 🍕 | Veggie Pizza | Pizza Icon | High | ❌ TODO |
| 🍟 | French Fries | Fries Icon | Medium | ❌ TODO |
| 🧅 | Onion Rings | Onion Icon | Medium | ❌ TODO |
| 🥖 | Garlic Bread | Bread Icon | Medium | ❌ TODO |
| 🥤 | Coca Cola | Cup Icon | Medium | ❌ TODO |
| 🥤 | Sprite | Cup Icon | Medium | ❌ TODO |
| 🧃 | Iced Tea | Cup Icon | Medium | ❌ TODO |
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 📋 | Bottom nav - Menu | Menu Icon | Medium | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### profile.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 👤 | Profile avatar placeholder | User Icon | High | ❌ TODO |
| ✓ | Email verified | Check Icon | Medium | ❌ TODO |
| ✗ | Phone verified (no) | X Icon | Medium | ❌ TODO |

### history.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 📦 | Bottom nav - Orders | Package Icon | High | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |
| ⏳ | Loading state | Clock Icon | Medium | ❌ TODO |
| 📭 | Empty state | Inbox Icon | Medium | ❌ TODO |
| ★ | Star rating | Star Icon | High | ❌ TODO |

### search.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| ⭐ | Restaurant rating | Star Icon | High | ❌ TODO |
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 📦 | Bottom nav - Orders | Package Icon | High | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### subscriptions.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| ⭐ | Bottom nav - Subs | Star Icon | High | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### offers.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 🎁 | Bottom nav - Offers | Gift Icon | Medium | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### wallet.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 💰 | Bottom nav - Wallet | Wallet Icon | High | ❌ TODO |
| 🏠 | Bottom nav - Home | Home Icon | High | ❌ TODO |
| 🔍 | Bottom nav - Search | Search Icon | High | ❌ TODO |
| 👤 | Bottom nav - Account | User Icon | High | ❌ TODO |

### order-details.tsx
| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🍽️ | Restaurant placeholder image | Utensils Icon | High | ❌ TODO |
| 🍔 | Order item placeholder | Burger Icon | High | ❌ TODO |

---

## Restaurant Dashboard (`apps/restaurant-dashboard/src/pages/index.tsx`)

| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🔥 | Header - Kitchen Display | Flame Icon | High | ❌ TODO |
| 🔊 | Sound toggle (unmuted) | Volume2 Icon | Medium | ❌ TODO |
| 🔇 | Sound toggle (muted) | VolumeX Icon | Medium | ❌ TODO |
| □/⊞ | Batch toggle button | LayoutGrid Icon | Medium | ❌ TODO |
| ↩ | Undo button | Undo Icon | Medium | ❌ TODO |
| 🚨 | New order alert banner | AlertCircle Icon | High | ❌ TODO |
| 🔥 | Tab - Kitchen | Flame Icon | High | ❌ TODO |
| 📦 | Tab - Inventory | Package Icon | High | ❌ TODO |
| 📦 | Inventory header | Package Icon | High | ❌ TODO |
| ⚠️ | Low stock warning | AlertTriangle Icon | High | ❌ TODO |
| 📋 | Order note icon | FileText Icon | Medium | ❌ TODO |
| ⏰ | Delayed button | Clock Icon | Medium | ❌ TODO |
| ✅ | Ready/Served button | Check Icon | High | ❌ TODO |

---

## Delivery Partner App (`apps/delivery-partner/App.tsx`)

| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🛵 | Header title | Scooter Icon | High | ❌ TODO |
| 🏠 | Tab - Home | Home Icon | High | ❌ TODO |
| 💰 | Tab - Earnings | Wallet Icon | High | ❌ TODO |
| 🚧 | Issue - Road Blocked | Construction Icon | Low | ❌ TODO |
| 📵 | Issue - No Response | PhoneOff Icon | Low | ❌ TODO |
| 🔋 | Issue - Battery Low | Battery Icon | Low | ❌ TODO |
| 🍽️ | Issue - Food Stuck | Utensils Icon | Low | ❌ TODO |
| 🎉 | Order accepted alert | CheckCircle Icon | High | ❌ TODO |
| 🏪 | Pickup status label | Store Icon | High | ❌ TODO |
| 📍 | Navigation buttons (x4) | Navigation Icon | High | ❌ TODO |
| 📋 | Auto-fill OTP button | Clipboard Icon | Medium | ❌ TODO |
| ⏳ | Idle state icon | Clock Icon | Medium | ❌ TODO |
| ⚡ | Demo order button | Zap Icon | Medium | ❌ TODO |
| ⚠️ | Report issue toggle | AlertCircle Icon | High | ❌ TODO |
| ⭐ | Rating display | Star Icon | High | ❌ TODO |
| 🏆 | Performance section | Trophy Icon | Medium | ❌ TODO |
| 📋 | Recent activity title | FileText Icon | Medium | ❌ TODO |
| 🚨 | New order alert | AlertCircle Icon | High | ❌ TODO |

---

## Super Admin (`apps/super-admin/src/pages/index.tsx`)

| Current | Location | Replacement | Priority | Status |
|---------|----------|-------------|----------|--------|
| 🌶️ | Sidebar brand | Pepper Icon | Medium | ❌ TODO |
| 📊 | Sidebar - Dashboard | BarChart Icon | High | ❌ TODO |
| 🛵 | Sidebar - Live Orders | Scooter Icon | High | ❌ TODO |
| 🏪 | Sidebar - Kitchen | Store Icon | High | ❌ TODO |
| 🛡️ | Sidebar - Support | Shield Icon | High | ❌ TODO |
| 📊 | Header - Overview | BarChart Icon | High | ❌ TODO |
| 🛵 | Header - Orders | Scooter Icon | High | ❌ TODO |
| 🏪 | Header - Branches | Store Icon | High | ❌ TODO |
| 🛡️ | Header - Support | Shield Icon | High | ❌ TODO |
| 🚨 | System alerts header | AlertCircle Icon | High | ❌ TODO |
| 💸 | Refund management | DollarSign Icon | High | ❌ TODO |
| 🛡️ | Fraud detection header | Shield Icon | High | ❌ TODO |
| 🚫 | Fraud block indicator | Ban Icon | Medium | ❌ TODO |

---

## Recommended Icon System: Lucide

### Primary Library
**Lucide** - Single consistent icon system across all platforms

| Platform | Package |
|----------|---------|
| Web (customer-web, restaurant-dashboard, super-admin) | `lucide-react` |
| Mobile (customer-mobile, delivery-partner) | `lucide-react-native` |

### Install Commands
```bash
# Web apps
npm install lucide-react

# React Native apps  
npm install lucide-react-native
```

### Benefits
- Modern SVG-first icons
- Tree-shakable (import only used icons)
- Premium look and feel
- Consistent across web + React Native
- Lightweight with customizable stroke width
- Excellent TypeScript support

### Priority Icons to Replace (High Priority)
These should be addressed first as they are core UI elements:

1. **Navigation icons**: Home, Search, User, Package, ShoppingCart, Wallet, ArrowLeft
2. **Action icons**: Check, X, Plus, Bell, CreditCard, MapPin, Star
3. **Status icons**: AlertCircle, CheckCircle, Flame, Store, Scooter

### Icon Mapping (Lucide)
| Emoji | Lucide Icon | Purpose |
|-------|-------------|---------|
| 🏠 | `Home` | Home/tab navigation |
| 🔍 | `Search` | Search functionality |
| 👤 | `User` | Profile/account |
| 📦 | `Package` | Orders/history |
| 🛒 | `ShoppingCart` | Cart |
| ← | `ArrowLeft` | Back navigation |
| ⭐ | `Star` | Ratings |
| 📍 | `MapPin` | Location |
| 🔔 | `Bell` | Notifications |
| 💳 | `CreditCard` | Payment method |
| ✅ | `Check` | Confirm/done |
| ⚠️ | `AlertCircle` | Warnings/errors |
| 🎉 | `CheckCircle` | Success state |

### Next Steps
1. Install `lucide-react` in customer-web, restaurant-dashboard, super-admin
2. Install `lucide-react-native` in customer-mobile, delivery-partner
3. Create shared icon wrapper in `packages/ui`
4. Replace high-priority icons first
5. Remove all emoji dependencies

---

## Icon Architecture (Created)

### Structure
```
packages/ui/icons/
│── navigation/   # HomeIcon, SearchIcon, ProfileIcon
│── commerce/     # CartIcon, OrderIcon, WalletIcon, PaymentIcon
│── delivery/     # DeliveryIcon
│── kitchen/      # KitchenIcon, FireIcon
│── admin/        # DashboardIcon, UsersIcon, ShieldIcon
│── system/       # NotificationIcon, RatingIcon, LocationIcon
│── status/       # CheckCircle, AlertCircle, AlertTriangle, X
│── brand/        # (empty - for custom SVGs)
│── index.ts      # Central exports
```

### Usage
```tsx
// Import from central location
import { CartIcon, HomeIcon } from '@spicegarden/ui/icons';

// Use with semantic tokens
<CartIcon size={24} />
```

### Semantic Token CSS (packages/ui/icons.css)
```css
:root {
  --icon-primary: var(--color-primary);
  --icon-secondary: var(--color-text-primary);
  --icon-muted: var(--color-text-secondary);
  --icon-danger: var(--color-danger);
  --icon-success: var(--color-success);
  --icon-warning: var(--color-warning);
}
```