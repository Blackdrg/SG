// Central Icon Exports - Single source of truth for all icons
// Never import directly from lucide-react - use these semantic exports

// Navigation Icons
export { HomeIcon } from './navigation/HomeIcon';
export { ProfileIcon } from './navigation/ProfileIcon';
export { SearchIcon } from './navigation/SearchIcon';

// Commerce Icons
export { CartIcon } from './commerce/CartIcon';
export { OrderIcon } from './commerce/OrderIcon';
export { WalletIcon } from './commerce/WalletIcon';
export { PaymentIcon } from './commerce/PaymentIcon';

// Delivery Icons
export { DeliveryIcon } from './delivery/DeliveryIcon';

// Kitchen Icons
export { KitchenIcon } from './kitchen/KitchenIcon';
export { FireIcon, Flame } from './kitchen/FireIcon';

// System Icons
export { NotificationIcon } from './system/NotificationIcon';
export { RatingIcon } from './system/RatingIcon';
export { LocationIcon } from './system/LocationIcon';

// Admin Icons
export { DashboardIcon } from './admin/AdminIcons';
export { UsersIcon } from './admin/AdminIcons';
export { ShieldIcon } from './admin/AdminIcons';

// Status Icons
export { CheckCircle } from 'lucide-react';
export { AlertCircle } from 'lucide-react';
export { AlertTriangle } from 'lucide-react';
export { X } from 'lucide-react';

// Utility Icons
export { ArrowLeft } from 'lucide-react';
export { Clock3 } from 'lucide-react';
export { Inbox } from 'lucide-react';
export { Gift } from 'lucide-react';
export { Store } from 'lucide-react';
export { Navigation } from 'lucide-react';
export { Clipboard } from 'lucide-react';
export { MessageCircle } from 'lucide-react';
export { Phone } from 'lucide-react';
export { MapPinned } from 'lucide-react';
export { TrendingUp } from 'lucide-react';
export { LayoutGrid } from 'lucide-react';
export { Undo } from 'lucide-react';
export { Volume2, VolumeX } from 'lucide-react';
export { Scooter } from 'lucide-react';
export { Trophy } from 'lucide-react';
export { FileText } from 'lucide-react';
export { Wifi } from 'lucide-react';
export { Map } from 'lucide-react';
export { Hand } from 'lucide-react';
export { HelpCircle } from 'lucide-react';
export { Zap } from 'lucide-react';
export { Construction } from 'lucide-react';
export { Battery } from 'lucide-react';
export { PhoneOff } from 'lucide-react';
export { Utensils } from 'lucide-react';
export { Ban } from 'lucide-react';
export { Banknote } from 'lucide-react';
export { Smartphone } from 'lucide-react';

// Semantic re-exports - just rename the exports
import { CartIcon as CartIconComponent } from './commerce/CartIcon';
import { OrderIcon as OrderIconComponent } from './commerce/OrderIcon';
import { DeliveryIcon as DeliveryIconComponent } from './delivery/DeliveryIcon';
import { KitchenIcon as KitchenIconComponent } from './kitchen/KitchenIcon';
import { NotificationIcon as NotificationIconComponent } from './system/NotificationIcon';
import { PaymentIcon as PaymentIconComponent } from './commerce/PaymentIcon';
import { LocationIcon as LocationIconComponent } from './system/LocationIcon';
import { RatingIcon as RatingIconComponent } from './system/RatingIcon';

export { CartIconComponent as Cart };
export { OrderIconComponent as Order };
export { DeliveryIconComponent as Delivery };
export { KitchenIconComponent as Kitchen };
export { NotificationIconComponent as Notification };
export { PaymentIconComponent as Payment };
export { LocationIconComponent as Location };
export { RatingIconComponent as Rating };