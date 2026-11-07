// Generated high-resolution photorealistic food images
import cheeseBurgerImg from '../assets/menu/cheese_burger.jpg';
import margheritaPizzaImg from '../assets/menu/margherita_pizza.jpg';
import frenchFriesImg from '../assets/menu/french_fries.jpg';
import icedBeverageImg from '../assets/menu/iced_beverage.jpg';
import coldCoffeeImg from '../assets/menu/cold_coffee.jpg';
import userRohitImg from '../assets/user_rohit.jpg';

// Isolated Category food images on pure white background
import catBurgerImg from '../assets/categories/cat_burger.jpg';
import catPizzaImg from '../assets/categories/cat_pizza.jpg';
import catWrapImg from '../assets/categories/cat_wrap.jpg';
import catFriesImg from '../assets/categories/cat_fries.jpg';
import catBeverageImg from '../assets/categories/cat_beverage.jpg';
import catDessertImg from '../assets/categories/cat_dessert.jpg';

// 3D Food Thumbnails from local assets
import butterChickenImg from '../assets/3d/butter_chicken.png';
import paneerTikkaImg from '../assets/3d/paneer_tikka.png';
import garlicNaanImg from '../assets/3d/garlic_naan.png';
import berryCheesecakeImg from '../assets/3d/berry_cheesecake.png';
import chickenRiceBowlImg from '../assets/3d/chicken_rice_bowl.png';
import pepperoniPizzaImg from '../assets/3d/pepperoni_pizza.png';

export {
  cheeseBurgerImg,
  margheritaPizzaImg,
  frenchFriesImg,
  icedBeverageImg,
  catBurgerImg,
  catPizzaImg,
  catWrapImg,
  catFriesImg,
  catBeverageImg,
  catDessertImg,
  coldCoffeeImg,
  userRohitImg,
};

export interface WebsiteCategory {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  isGridIcon?: boolean;
}

export interface WebsiteProduct {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  isBestseller?: boolean;
  isVeg?: boolean;
  description?: string;
}

// Categories exactly matching the uploaded screenshot:
// [All, Burgers, Pizza, Wraps, Fries, Beverages, Desserts]
export const RESTO_CATEGORIES: WebsiteCategory[] = [
  { id: 'all', name: 'All', isGridIcon: true },
  {
    id: 'burgers',
    name: 'Burgers',
    image: catBurgerImg,
  },
  {
    id: 'pizza',
    name: 'Pizza',
    image: catPizzaImg,
  },
  {
    id: 'wraps',
    name: 'Wraps',
    image: catWrapImg,
  },
  {
    id: 'fries',
    name: 'Fries',
    image: catFriesImg,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    image: catBeverageImg,
  },
  {
    id: 'desserts',
    name: 'Desserts',
    image: catDessertImg,
  },
];

// Products exactly matching the uploaded screenshot cards:
export const RESTO_PRODUCTS: WebsiteProduct[] = [
  // 1. Cheese Burger (Top Left in screenshot: ⭐ Bestseller, ₹220)
  {
    id: 'item-cheese-burger',
    name: 'Cheese Burger',
    category: 'burgers',
    subtitle: 'Juicy patty, cheese, fresh veggies',
    price: 220,
    originalPrice: 260,
    image: cheeseBurgerImg,
    isBestseller: true,
    isVeg: false,
    description: 'Juicy double grilled patty with melted cheddar, crisp lettuce, tomato and signature sauce on sesame brioche.',
  },
  // 2. Margherita Pizza (Top Right in screenshot: ⊡ Veg, ₹320)
  {
    id: 'item-margherita-pizza',
    name: 'Margherita Pizza',
    category: 'pizza',
    subtitle: 'Classic tomato, mozzarella & basil',
    price: 320,
    originalPrice: 380,
    image: margheritaPizzaImg,
    isVeg: true,
    description: 'Authentic stone-baked pizza topped with San Marzano tomato sauce, fresh mozzarella di bufala and fragrant basil.',
  },
  // 3. Crispy French Fries (Bottom Left in screenshot: ₹140)
  {
    id: 'item-french-fries',
    name: 'French Fries',
    category: 'fries',
    subtitle: 'Golden, crispy, salted to perfection',
    price: 140,
    originalPrice: 170,
    image: frenchFriesImg,
    isVeg: true,
    description: 'Crisp salted golden potatoes served hot in a signature chef container with ketchup dip.',
  },
  // 4. Iced Cola Cooler (Bottom Right in screenshot: ₹90)
  {
    id: 'item-iced-beverage',
    name: 'Iced Cola Cooler',
    category: 'beverages',
    subtitle: 'Chilled refreshment with lemon slice',
    price: 90,
    originalPrice: 110,
    image: icedBeverageImg,
    isVeg: true,
    description: 'Ice cold refreshing sparkling cola served over clear crystal ice cubes with fresh lime wedge.',
  },
  // 5. Wraps
  {
    id: 'item-paneer-wrap',
    name: 'Paneer Tikka Wrap',
    category: 'wraps',
    subtitle: 'Tandoori paneer & mint chutney roll',
    price: 180,
    originalPrice: 220,
    image: paneerTikkaImg,
    isBestseller: true,
    isVeg: true,
    description: 'Charcoal grilled spicy paneer cubes rolled in soft handmade flatbread with crunchy onions and mint mayo.',
  },
  {
    id: 'item-chicken-wrap',
    name: 'Smoked Chicken Shawarma Wrap',
    category: 'wraps',
    subtitle: 'Tender chicken, garlic tahini & pickles',
    price: 210,
    originalPrice: 250,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    description: 'Slow roasted chicken shavings rolled with garlic toum sauce, pickled veggies and fries.',
  },
  // 6. Gourmet Pizza & Mains
  {
    id: 'item-pepperoni-pizza',
    name: 'Pepperoni Feast Pizza',
    category: 'pizza',
    subtitle: 'Spicy pepperoni slices & mozzarella',
    price: 390,
    originalPrice: 450,
    image: pepperoniPizzaImg,
    isBestseller: true,
    isVeg: false,
    description: 'Generously loaded with Italian cured pepperoni, rich marinara sauce and stringy mozzarella.',
  },
  {
    id: 'item-butter-chicken-bowl',
    name: 'Butter Chicken Rice Bowl',
    category: 'mains',
    subtitle: 'Tender chicken curry with basmati rice',
    price: 340,
    originalPrice: 390,
    image: butterChickenImg,
    isBestseller: true,
    isVeg: false,
    description: 'Rich velvety Delhi-style butter chicken served alongside fragrant basmati steamed rice.',
  },
  {
    id: 'item-garlic-naan',
    name: 'Butter Garlic Naan',
    category: 'mains',
    subtitle: 'Clay-oven baked fluffy bread',
    price: 80,
    originalPrice: 100,
    image: garlicNaanImg,
    isVeg: true,
    description: 'Traditional tandoori flatbread brushed with crushed roasted garlic and pure desi butter.',
  },
  // 7. Fries & Sides
  {
    id: 'item-cheese-fries',
    name: 'Loaded Cheesy Fries',
    category: 'fries',
    subtitle: 'Melted cheddar cheese & jalapeños',
    price: 170,
    originalPrice: 210,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    description: 'Crispy fries smothered in hot liquid cheddar cheese sauce and pickled spicy jalapeño rings.',
  },
  // 8. Desserts
  {
    id: 'item-berry-cheesecake',
    name: 'Wild Berry Cheesecake',
    category: 'desserts',
    subtitle: 'Velvety cream cheese with fruit compote',
    price: 190,
    originalPrice: 230,
    image: berryCheesecakeImg,
    isBestseller: true,
    isVeg: true,
    description: 'New York style baked cheesecake finished with a glaze of fresh raspberries and blueberries.',
  },
  {
    id: 'item-teriyaki-bowl',
    name: 'Teriyaki Chicken Bowl',
    category: 'mains',
    subtitle: 'Glazed chicken with sesame greens',
    price: 290,
    originalPrice: 340,
    image: chickenRiceBowlImg,
    isVeg: false,
    description: 'Tender chicken glazed in homemade teriyaki sauce over steamed jasmine rice.',
  },
];

export interface WebsiteReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  table?: string;
  avatarBg: string;
  tags: string[];
}

export const INITIAL_REVIEWS: WebsiteReview[] = [
  {
    id: 'rev-1',
    name: 'Aman Verma',
    rating: 5,
    date: '2 hours ago',
    comment: 'The Cheese Burger and Crispy Fries were amazing! Extremely fast service at Table T-06.',
    table: 'Table T-06',
    avatarBg: 'bg-emerald-500',
    tags: ['Delicious Food', 'Fast Service'],
  },
  {
    id: 'rev-2',
    name: 'Priya Sharma',
    rating: 5,
    date: 'Yesterday',
    comment: 'Margherita Pizza crust was super airy and crispy. Ordering from QR is very smooth!',
    table: 'Table T-02',
    avatarBg: 'bg-blue-500',
    tags: ['Smooth QR Scan', 'Clean & Hygienic'],
  },
  {
    id: 'rev-3',
    name: 'Rohan Mehta',
    rating: 5,
    date: '2 days ago',
    comment: 'The iced cola cooler and chicken wrap combo was top notch. Great ambiance.',
    table: 'Table T-04',
    avatarBg: 'bg-amber-500',
    tags: ['Top Tier Taste', 'Friendly Staff'],
  },
];

export interface WebsiteCoupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  pointsCost: number;
  expiresIn: string;
  bgColor: string;
}

export const LOYALTY_COUPONS: WebsiteCoupon[] = [
  {
    id: 'coup-1',
    code: 'BURGER50',
    title: '₹50 OFF on Cheese Burger',
    discount: '₹50 Instant Discount',
    pointsCost: 100,
    expiresIn: 'Valid today',
    bgColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'coup-2',
    code: 'FREEFRIES',
    title: 'Free Crispy French Fries',
    discount: 'Complimentary Dish',
    pointsCost: 150,
    expiresIn: 'On orders above ₹300',
    bgColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'coup-3',
    code: 'VIPPIZZA',
    title: '20% OFF Any Pizza',
    discount: '20% Flat Discount',
    pointsCost: 200,
    expiresIn: 'Dine-in exclusive',
    bgColor: 'from-purple-500 to-pink-600',
  },
];
