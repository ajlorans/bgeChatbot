// Product database for Big Green Egg products
// Source: https://biggreenegg.com/

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  url: string;
  category: string;
  keywords: string[];
  compatibleWith?: string[]; // EGG sizes this product is compatible with
  specifications?: {
    weight?: string;
    dimensions?: string;
    cookingArea?: string;
    cookingGrid?: string;
    maxTemp?: string;
    features?: string[];
  };
}

// Main product categories
export const productCategories = [
  "Eggs",
  "Egg Packages",
  "Modular Systems",
  "Tables & Stands",
  "Ceramics & Grids",
  "EGGspander System",
  "Pizza",
  "Covers & Cleaning",
  "Temperature Control",
  "Cookware & Tools",
  "Charcoal, Wood & Starters",
  "Rubs & Sauces",
  "Lifestyle & Gear",
  "Replacement Parts"
];

export const products: Product[] = [
  // Eggs
  {
    id: "2xl-egg",
    name: "2XL Big Green Egg",
    description: "Our largest EGG, perfect for very large gatherings and commercial use. Can cook up to 20 steaks at once.",
    price: "From $2,649.99",
    url: "https://biggreenegg.com/products/2xl-big-green-egg",
    category: "Eggs",
    keywords: ["2xl", "egg", "large", "commercial", "biggest", "xxl", "2x", "2-xl", "two xl", "double xl"],
    specifications: {
      weight: "375 lbs (170 kg)",
      dimensions: "29\"H x 30\"W (seat height with nest: 36\")",
      cookingArea: "672 sq in (4,336 sq cm)",
      cookingGrid: "29\" diameter (73.7 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Can cook up to 20 steaks at once",
        "Fits up to two 20-pound turkeys simultaneously",
        "Perfect for commercial use or very large gatherings",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  {
    id: "xl-egg",
    name: "XL Big Green Egg",
    description: "Great for larger families and entertaining. Can cook two 20-pound turkeys at once.",
    price: "From $1,599.99",
    url: "https://biggreenegg.com/products/xl-big-green-egg",
    category: "Eggs",
    keywords: ["xl", "egg", "extra large", "family", "entertaining", "x-large", "extra-large", "big", "large"],
    specifications: {
      weight: "219 lbs (99.3 kg)",
      dimensions: "27.3\"H x 25.6\"W (seat height with nest: 34.3\")",
      cookingArea: "452 sq in (2,919 sq cm)",
      cookingGrid: "24\" diameter (61 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Suitable for families and entertaining",
        "Can cook 1-2 whole 20 lb turkeys",
        "12 steaks or 24 burgers at once",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  {
    id: "large-egg",
    name: "Large Big Green Egg",
    description: "Our most popular size, perfect for most families. Versatile for everything from appetizers to entrees.",
    price: "From $1,149.99",
    url: "https://biggreenegg.com/products/large-big-green-egg",
    category: "Eggs",
    keywords: ["large", "egg", "popular", "family"],
    specifications: {
      weight: "162 lbs (73.5 kg)",
      dimensions: "20\"H x 21\"W (seat height with nest: 32\")",
      cookingArea: "262 sq in (1,688 sq cm)",
      cookingGrid: "18.25\" diameter (46.4 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Most popular EGG size",
        "Perfect for families of 4-6",
        "Fits 8 steaks or 6 chickens at once",
        "Can cook a 20 lb turkey",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  {
    id: "medium-egg",
    name: "Medium Big Green Egg",
    description: "Perfect for smaller families or limited spaces while still providing plenty of cooking area.",
    price: "From $839.99",
    url: "https://biggreenegg.com/products/medium-big-green-egg",
    category: "Eggs",
    keywords: ["medium", "egg", "small family", "limited space"],
    specifications: {
      weight: "113 lbs (51.3 kg)",
      dimensions: "18.5\"H x 18.25\"W (seat height with nest: 30.5\")",
      cookingArea: "177 sq in (1,140 sq cm)",
      cookingGrid: "15\" diameter (38.1 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Perfect for small families",
        "Fits up to 4 steaks or 1 whole chicken",
        "Great for balconies and smaller patios",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  {
    id: "small-egg",
    name: "Small Big Green Egg",
    description: "Great for individuals, couples, or small spaces like balconies and small patios.",
    price: "From $689.99",
    url: "https://biggreenegg.com/products/small-big-green-egg",
    category: "Eggs",
    keywords: ["small", "egg", "couple", "individual", "balcony", "patio"],
    specifications: {
      weight: "80 lbs (36.3 kg)",
      dimensions: "15.5\"H x 16\"W (seat height with nest: 27.5\")",
      cookingArea: "133 sq in (858 sq cm)",
      cookingGrid: "13\" diameter (33 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Perfect for couples, individuals, or small spaces",
        "Fits 2-4 steaks or 1 small chicken",
        "Excellent for apartments and balconies",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  {
    id: "minimax-egg",
    name: "MiniMax Big Green Egg",
    description: "Portable yet powerful. Perfect for tailgating, camping, or small patios.",
    price: "From $734.99",
    url: "https://biggreenegg.com/products/minimax-big-green-egg",
    category: "Eggs",
    keywords: ["minimax", "mini max", "egg", "portable", "camping", "tailgating"],
    specifications: {
      weight: "76 lbs (34.5 kg)",
      dimensions: "13\"H x 16\"W (19.5\" height with built-in carrying handles)",
      cookingArea: "133 sq in (858 sq cm)",
      cookingGrid: "13\" diameter (33 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Portable design with built-in carrying handles",
        "Same cooking area as Small EGG in a more compact package",
        "Perfect for tailgating, camping, and tabletop cooking",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  {
    id: "mini-egg",
    name: "Mini Big Green Egg",
    description: "Our most portable option. Perfect for camping, picnics, or table-top cooking.",
    price: "From $489.99",
    url: "https://biggreenegg.com/products/mini-big-green-egg",
    category: "Eggs",
    keywords: ["mini", "egg", "portable", "camping", "picnic", "tabletop"],
    specifications: {
      weight: "39 lbs (17.7 kg)",
      dimensions: "12\"H x 13\"W",
      cookingArea: "78.5 sq in (506 sq cm)",
      cookingGrid: "10\" diameter (25.4 cm)",
      maxTemp: "750°F (400°C)",
      features: [
        "Most portable EGG option",
        "Perfect for camping, picnics, and travel",
        "Fits 2 steaks or 1 small chicken",
        "Compact tabletop design",
        "Includes stainless steel cooking grid"
      ]
    }
  },
  
  // Egg Packages
  {
    id: "xl-corner-package",
    name: "XL Big Green Egg in a Corner Modular Package",
    description: "Complete package featuring the XL Big Green Egg in a corner modular nest configuration.",
    price: "From $2,429.00",
    url: "https://biggreenegg.com/products/xl-big-green-egg-in-a-corner-modular-package",
    category: "Egg Packages",
    keywords: ["xl", "package", "corner", "modular", "nest"],
    specifications: {
      weight: "280 lbs (127 kg) total package weight",
      dimensions: "27.3\"H x 25.6\"W egg + corner modular nest dimensions",
      cookingArea: "452 sq in (2,919 sq cm)",
      cookingGrid: "24\" diameter (61 cm)",
      features: [
        "Includes XL Big Green Egg",
        "Corner Modular Nest configuration",
        "Stainless steel cooking grid",
        "Sturdy, weather-resistant design",
        "Convenient workspace on both sides",
        "Can be expanded with additional modular components"
      ]
    }
  },
  {
    id: "large-acacia-package",
    name: "Large Big Green Egg in Acacia Table Package",
    description: "Complete package featuring the Large Big Green Egg in a beautiful acacia hardwood table.",
    price: "From $2,019.00",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/large-big-green-egg-in-acacia-table-package",
    category: "Egg Packages",
    keywords: ["large", "package", "acacia", "table", "hardwood"],
    specifications: {
      weight: "240 lbs (109 kg) total package weight",
      dimensions: "32\"H x 60\"W x 25\"D assembled dimensions",
      cookingArea: "262 sq in (1,688 sq cm)",
      cookingGrid: "18.25\" diameter (46.4 cm)",
      features: [
        "Includes Large Big Green Egg",
        "Solid acacia hardwood table",
        "Table nest (raises EGG off table surface)",
        "Stainless steel cooking grid",
        "Ample workspace for food prep and serving",
        "Beautiful, weather-resistant hardwood construction"
      ]
    }
  },
  {
    id: "minimax-package",
    name: "MiniMax Big Green Egg Package",
    description: "Complete package featuring the portable MiniMax Big Green Egg with carrier.",
    price: "From $859.00",
    url: "https://biggreenegg.com/products/minimax-big-green-egg-package",
    category: "Egg Packages",
    keywords: ["minimax", "mini max", "package", "portable", "carrier"],
    specifications: {
      weight: "90 lbs (40.8 kg) total package weight",
      dimensions: "19.5\"H x 16\"W with carrier",
      cookingArea: "133 sq in (858 sq cm)",
      cookingGrid: "13\" diameter (33 cm)",
      features: [
        "Includes MiniMax Big Green Egg",
        "Portable EGG Carrier with built-in handles",
        "Stainless steel cooking grid",
        "Perfect for tailgating and camping",
        "Same cooking area as the Small EGG in a more portable design"
      ]
    }
  },
  {
    id: "large-integgrated-package",
    name: "Large Big Green Egg in an intEGGrated Nest+Handler with Mates Package",
    description: "Complete package featuring the Large Big Green Egg in an intEGGrated nest with handler and side shelves.",
    price: "From $1,849.00",
    url: "https://biggreenegg.com/products/large-big-green-egg-in-an-integgrated-nest-handler-with-mates-package",
    category: "Egg Packages",
    keywords: ["large", "package", "integgrated", "nest", "handler", "mates", "shelves"],
    specifications: {
      weight: "210 lbs (95.3 kg) total package weight",
      dimensions: "48.5\"W x 32\"H x 27\"D with mates extended",
      cookingArea: "262 sq in (1,688 sq cm)",
      cookingGrid: "18.25\" diameter (46.4 cm)",
      features: [
        "Includes Large Big Green Egg",
        "intEGGrated Nest+Handler with locking caster wheels for mobility",
        "Wooden EGG Mates (folding side shelves)",
        "Stainless steel cooking grid",
        "Convenient workspace that folds down when not in use",
        "Easy to move and position with the integrated handler"
      ]
    }
  },
  
  // Accessories
  {
    id: "pizza-wedge",
    name: "Pizza Oven Wedge for Large EGG",
    description: "Creates the perfect environment for cooking pizzas with crispy crusts and perfectly melted toppings.",
    price: "$119.99",
    url: "https://biggreenegg.com/products/pizza-oven-wedge-for-large-egg",
    category: "Pizza",
    keywords: ["pizza", "wedge", "oven", "large", "accessory"],
    compatibleWith: ["Large"]
  },
  {
    id: "cover-acacia-table",
    name: "Cover E - Fits Acacia Table for L",
    description: "Premium weather-resistant cover designed specifically for the Large EGG in an acacia table.",
    price: "$82.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-e-fits-acacia-table-for-l",
    category: "Covers & Cleaning",
    keywords: ["cover", "acacia", "table", "large", "weather", "protection"],
    compatibleWith: ["Large"]
  },
  {
    id: "egg-genius",
    name: "EGG Genius Temperature Controller",
    description: "Monitor and adjust your EGG's temperature remotely for perfect results every time.",
    price: "$249.99",
    url: "https://biggreenegg.com/products/egg-genius-temperature-controller",
    category: "Temperature Control",
    keywords: ["genius", "temperature", "controller", "remote", "monitor", "wifi", "bluetooth"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "eggspander-xl",
    name: "5-Piece EGGspander Kit for XL",
    description: "Versatile system that allows you to cook multiple dishes at different temperatures simultaneously.",
    price: "$349.99",
    url: "https://biggreenegg.com/products/5-piece-eggspander-kit-for-xl",
    category: "EGGspander System",
    keywords: ["eggspander", "kit", "xl", "multi-level", "cooking", "system"],
    compatibleWith: ["XL"]
  },
  {
    id: "fire-bowl",
    name: "Stainless Steel Fire Bowl",
    description: "Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.",
    price: "From $84.99",
    url: "https://biggreenegg.com/products/stainless-steel-fire-bowl",
    category: "Ceramics & Grids",
    keywords: ["fire bowl", "stainless", "steel", "airflow", "cleanup"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "whiskey-chips",
    name: "Premium Whiskey Barrel Smoking Chips",
    description: "Made from genuine whiskey barrels and impart a unique, rich flavor to your smoked foods.",
    price: "$14.99",
    url: "https://biggreenegg.com/products/premium-whiskey-barrel-smoking-chips-2-9-l-180-cu-in",
    category: "Charcoal, Wood & Starters",
    keywords: ["whiskey", "chips", "smoking", "wood", "flavor"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "half-grid",
    name: "Stainless Steel Half Grid",
    description: "Gives you more flexibility in your cooking setup. Perfect for creating different temperature zones.",
    price: "From $32.99",
    url: "https://biggreenegg.com/products/stainless-steel-half-grid",
    category: "Ceramics & Grids",
    keywords: ["half grid", "stainless", "steel", "cooking", "surface", "flexibility"],
    compatibleWith: ["XL", "Large"]
  },
  {
    id: "stainless-grid",
    name: "Stainless Steel Grid",
    description: "Durable stainless steel grid provides excellent heat retention and is built to last.",
    price: "From $41.99",
    url: "https://biggreenegg.com/products/stainless-steel-grid",
    category: "Ceramics & Grids",
    keywords: ["grid", "stainless", "steel", "cooking", "surface"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  
  // Tables & Stands
  {
    id: "acacia-table-large",
    name: "Table - Solid Acacia Hardwood for Large EGG",
    description: "Beautiful, durable option that provides ample workspace for your Large EGG.",
    price: "From $659.99",
    url: "https://biggreenegg.com/collections/all-modular-system-tables-stands/products/table-solid-acacia-hardwood-for-large-egg",
    category: "Tables & Stands",
    keywords: ["table", "acacia", "hardwood", "large", "workspace"],
    compatibleWith: ["Large"]
  },
  {
    id: "acacia-table-xl",
    name: "Table - Solid Acacia Hardwood for XL Egg",
    description: "Beautiful, durable option that provides ample workspace for your XL EGG.",
    price: "From $699.99",
    url: "https://biggreenegg.com/collections/all-modular-system-tables-stands/products/table-solid-acacia-hardwood-for-xl-egg",
    category: "Tables & Stands",
    keywords: ["table", "acacia", "hardwood", "xl", "workspace"],
    compatibleWith: ["XL"]
  },
  {
    id: "distressed-insert",
    name: "Distressed Acacia Insert for Modular Nest System",
    description: "Stylish distressed acacia wood insert for the modular nest system.",
    price: "$104.99",
    url: "https://biggreenegg.com/products/distressed-acacia-insert-for-modular-nest-system",
    category: "Tables & Stands",
    keywords: ["insert", "distressed", "acacia", "modular", "nest"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "stainless-insert",
    name: "Solid Stainless Steel Insert for Modular Nest System",
    description: "Durable stainless steel insert for the modular nest system.",
    price: "$299.99",
    url: "https://biggreenegg.com/products/solid-stainless-steel-insert-for-modular-nest-system",
    category: "Tables & Stands",
    keywords: ["insert", "stainless", "steel", "modular", "nest"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "xl-corner-nest",
    name: "XL Corner Modular Nest",
    description: "Corner configuration modular nest for the XL Big Green Egg.",
    price: "From $599.99",
    url: "https://biggreenegg.com/products/xl-corner-modular-nest",
    category: "Tables & Stands",
    keywords: ["corner", "modular", "nest", "xl", "stand"],
    compatibleWith: ["XL"]
  },
  {
    id: "large-corner-nest",
    name: "Large Corner Modular Nest",
    description: "Corner configuration modular nest for the Large Big Green Egg.",
    price: "From $599.99",
    url: "https://biggreenegg.com/products/large-corner-modular-nest",
    category: "Tables & Stands",
    keywords: ["corner", "modular", "nest", "large", "stand"],
    compatibleWith: ["Large"]
  },
  
  // Apparel
  {
    id: "mens-bone-tshirt",
    name: "Big Green Egg Men's Bone T-Shirt",
    description: "Comfortable cotton t-shirt featuring the Big Green Egg logo.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/big-green-egg-mens-bone-t-shirt",
    category: "Lifestyle & Gear",
    keywords: ["t-shirt", "tshirt", "bone", "apparel", "clothing", "men"]
  },
  {
    id: "mens-bone-hoodie",
    name: "Big Green Egg Men's Bone Olsons Hoodie",
    description: "Warm, comfortable hoodie featuring the Big Green Egg logo.",
    price: "$49.99",
    url: "https://biggreenegg.com/products/big-green-egg-mens-bone-olsons-hoodie",
    category: "Lifestyle & Gear",
    keywords: ["hoodie", "bone", "apparel", "clothing", "men", "sweatshirt"]
  },
  {
    id: "eggspert-shirt",
    name: "EGGspert Mechanic-Style Shirt",
    description: "Professional mechanic-style shirt for the true EGGspert.",
    price: "$39.99",
    url: "https://biggreenegg.com/products/eggspert-mechanic-style-shirt",
    category: "Lifestyle & Gear",
    keywords: ["eggspert", "mechanic", "shirt", "apparel", "clothing"]
  },
  
  // Replacement Parts
  {
    id: "replacement-gasket",
    name: "Replacement Gasket for Big Green Egg",
    description: "High-temperature gasket to ensure a proper seal between the dome and base of your EGG.",
    price: "From $24.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-gasket",
    category: "Replacement Parts",
    keywords: ["gasket", "seal", "replacement", "part", "repair"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-firebox",
    name: "Replacement Fire Box",
    description: "Ceramic fire box replacement for your Big Green Egg.",
    price: "From $89.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-fire-box",
    category: "Replacement Parts",
    keywords: ["firebox", "fire box", "replacement", "part", "repair", "ceramic"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-fire-ring",
    name: "Replacement Fire Ring",
    description: "Ceramic fire ring replacement for your Big Green Egg.",
    price: "From $79.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-fire-ring",
    category: "Replacement Parts",
    keywords: ["fire ring", "replacement", "part", "repair", "ceramic"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-thermometer",
    name: "Replacement Thermometer",
    description: "Replacement dome thermometer for your Big Green Egg.",
    price: "$29.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-thermometer",
    category: "Replacement Parts",
    keywords: ["thermometer", "temperature", "gauge", "replacement", "part", "repair"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  // Additional products
  {
    id: "conveggtor",
    name: "ConvEGGtor",
    description: "Essential for indirect cooking, creating a heat barrier between the food and the fire for convection cooking.",
    price: "From $99.99",
    url: "https://biggreenegg.com/products/conveggtor",
    category: "Ceramics & Grids",
    keywords: ["conveggtor", "plate setter", "indirect", "cooking", "barrier", "convection", "baking", "smoking", "heat deflector"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "pizza-stone",
    name: "Pizza & Baking Stone",
    description: "Perfect for pizzas, breads, desserts and other baked goods. Creates a brick-oven effect for crispy crusts.",
    price: "$69.99",
    url: "https://biggreenegg.com/collections/pizza/products/pizza-baking-stone",
    category: "Pizza",
    keywords: ["pizza", "stone", "baking", "bread", "dessert", "crispy", "crust", "ceramic"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "pizza-peel",
    name: "Aluminum Pizza Peel",
    description: "Essential tool for sliding pizzas onto the cooking surface. Thin edge easily slides under pizza and breads.",
    price: "$39.99",
    url: "https://biggreenegg.com/products/aluminum-pizza-peel",
    category: "Pizza",
    keywords: ["pizza", "peel", "aluminum", "sliding", "tool", "bread", "baking"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "cast-iron-grid",
    name: "Cast Iron Grid",
    description: "Perfect for creating sear marks on steaks and chops. Excellent heat retention for cooking on both sides.",
    price: "From $69.99",
    url: "https://biggreenegg.com/products/cast-iron-grid",
    category: "Ceramics & Grids",
    keywords: ["cast iron", "grid", "sear", "grill", "cooking", "surface", "marks", "heat retention"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "cast-iron-skillet",
    name: "Cast Iron Skillet",
    description: "Versatile cooking vessel perfect for everything from breakfast to desserts. Pre-seasoned and ready to use.",
    price: "$59.99",
    url: "https://biggreenegg.com/products/cast-iron-skillet",
    category: "Cookware & Tools",
    keywords: ["cast iron", "skillet", "pan", "frying", "cooking", "versatile"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "eggspander-large",
    name: "5-Piece EGGspander Kit for Large",
    description: "Versatile system that allows you to cook multiple dishes at different temperatures simultaneously on your Large EGG.",
    price: "$329.99",
    url: "https://biggreenegg.com/products/5-piece-eggspander-kit-for-large",
    category: "EGGspander System",
    keywords: ["eggspander", "kit", "large", "multi-level", "cooking", "system", "multilevel", "rack", "expander"],
    compatibleWith: ["Large"]
  },
  {
    id: "eggspander-medium",
    name: "5-Piece EGGspander Kit for Medium",
    description: "Versatile system that allows you to cook multiple dishes at different temperatures simultaneously on your Medium EGG.",
    price: "$299.99",
    url: "https://biggreenegg.com/products/5-piece-eggspander-kit-for-medium",
    category: "EGGspander System",
    keywords: ["eggspander", "kit", "medium", "multi-level", "cooking", "system", "multilevel", "rack", "expander"],
    compatibleWith: ["Medium"]
  },
  {
    id: "grill-gripper",
    name: "Grill Gripper",
    description: "Essential tool for safely and easily lifting hot cooking grids. Makes handling hot grids safe and simple.",
    price: "$24.99",
    url: "https://biggreenegg.com/products/grill-gripper",
    category: "Cookware & Tools",
    keywords: ["grill", "gripper", "tool", "grid", "lift", "handle", "safety"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "ash-tool",
    name: "Ash Tool",
    description: "Designed for safe and easy cleanup of ash after cooking. Cleanly removes ash while protecting the ceramic firebox.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/ash-tool",
    category: "Cookware & Tools",
    keywords: ["ash", "tool", "cleanup", "cleaning", "rake", "remove", "maintenance"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "charcoal-starter",
    name: "Electric Charcoal Starter",
    description: "Quickly and safely lights charcoal without lighter fluid. Gets your EGG ready to cook in minutes.",
    price: "$39.99",
    url: "https://biggreenegg.com/products/electric-charcoal-starter",
    category: "Charcoal, Wood & Starters",
    keywords: ["charcoal", "starter", "electric", "lighting", "ignite", "fire", "starting"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "premium-charcoal",
    name: "Premium Organic Lump Charcoal",
    description: "100% natural hardwood charcoal for superior flavor. Burns cleaner and longer than briquettes.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/premium-organic-lump-charcoal",
    category: "Charcoal, Wood & Starters",
    keywords: ["charcoal", "lump", "organic", "premium", "hardwood", "fuel", "natural"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "hickory-chips",
    name: "Hickory Smoking Chips",
    description: "Classic smoking chips that add rich, savory flavor to foods. Perfect for pork, chicken, beef and cheese.",
    price: "$14.99",
    url: "https://biggreenegg.com/collections/charcoal-wood-starters/products/hickory-smoking-chips-2-9-l-180-cu-in",
    category: "Charcoal, Wood & Starters",
    keywords: ["hickory", "smoking chips", "wood chips", "smoke flavor", "smoking"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "apple-chips",
    name: "Apple Smoking Chips",
    description: "Mild, sweet smoking chips perfect for poultry, pork and fish. Adds delicate fruity flavor to foods.",
    price: "$14.99",
    url: "https://biggreenegg.com/collections/charcoal-wood-starters/products/apple-smoking-chips-2-9-l-180-cu-in",
    category: "Charcoal, Wood & Starters",
    keywords: ["apple", "smoking chips", "wood chips", "smoke flavor", "smoking", "fruit wood"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "instant-thermometer",
    name: "Instant Read Digital Thermometer",
    description: "Fast, accurate temperature readings in seconds. Essential for ensuring perfectly cooked meats.",
    price: "$39.99",
    url: "https://biggreenegg.com/products/instant-read-digital-thermometer",
    category: "Temperature Control",
    keywords: ["thermometer", "digital", "instant", "read", "temperature", "probe", "meat"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "wireless-thermometer",
    name: "Wireless Dual Probe Thermometer",
    description: "Monitor food and EGG temperatures from a distance. Includes alerts and preset cooking programs.",
    price: "$99.99",
    url: "https://biggreenegg.com/products/wireless-dual-probe-thermometer",
    category: "Temperature Control",
    keywords: ["thermometer", "wireless", "probe", "remote", "monitor", "temperature", "dual"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "all-purpose-rub",
    name: "Big Green Egg All-Purpose Rub",
    description: "Versatile seasoning blend that enhances the flavor of virtually any food. Perfect for meats, vegetables, and more.",
    price: "$12.99",
    url: "https://biggreenegg.com/products/big-green-egg-all-purpose-rub",
    category: "Rubs & Sauces",
    keywords: ["rub", "seasoning", "all-purpose", "spices", "flavor", "blend"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "bbq-sauce",
    name: "Big Green Egg Classic BBQ Sauce",
    description: "Sweet and tangy sauce perfect for ribs, chicken, and pork. Made with premium ingredients.",
    price: "$9.99",
    url: "https://biggreenegg.com/products/big-green-egg-classic-bbq-sauce",
    category: "Rubs & Sauces",
    keywords: ["bbq", "sauce", "barbecue", "classic", "sweet", "tangy", "condiment"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "meat-claws",
    name: "Meat Claws",
    description: "Perfect tool for shredding pulled pork and handling large cuts of meat. Provides a secure grip for lifting and carrying.",
    price: "$19.99",
    url: "https://biggreenegg.com/products/meat-claws",
    category: "Cookware & Tools",
    keywords: ["meat", "claws", "shred", "pulled pork", "handling", "tool", "bear"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "rib-rack",
    name: "Vertical Rib Rack",
    description: "Holds up to 5 racks of ribs vertically to maximize cooking space. Perfect for smoking multiple racks at once.",
    price: "$34.99",
    url: "https://biggreenegg.com/products/vertical-rib-rack",
    category: "Cookware & Tools",
    keywords: ["rib", "rack", "vertical", "smoking", "space", "holder", "stand"],
    compatibleWith: ["2XL", "XL", "Large", "Medium"]
  },
  {
    id: "poultry-roaster",
    name: "Ceramic Poultry Roaster",
    description: "Creates perfectly roasted poultry with crispy skin and moist meat. Cavity holds liquids for added flavor and moisture.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/ceramic-poultry-roaster",
    category: "Cookware & Tools",
    keywords: ["poultry", "roaster", "chicken", "turkey", "ceramic", "holder", "stand"],
    compatibleWith: ["2XL", "XL", "Large", "Medium"]
  },
  {
    id: "deep-dish-stone",
    name: "Deep Dish Pizza & Baking Stone",
    description: "Perfect for deep dish pizzas, pies, and more. Even heat distribution for perfect results every time.",
    price: "$79.99",
    url: "https://biggreenegg.com/collections/pizza/products/deep-dish-pizza-baking-stone",
    category: "Pizza",
    keywords: ["deep dish", "pizza", "stone", "baking", "pie", "deep", "ceramic"],
    compatibleWith: ["2XL", "XL", "Large"]
  },
  {
    id: "integgrated-nest",
    name: "intEGGrated Nest+Handler",
    description: "Stable base with handles that makes it easy to move your EGG. Includes locking casters for stability.",
    price: "From $199.99",
    url: "https://biggreenegg.com/products/integgrated-nest-handler",
    category: "Tables & Stands",
    keywords: ["nest", "handler", "stand", "wheels", "base", "mobile", "integgrated", "move"],
    compatibleWith: ["XL", "Large", "Medium"]
  },
  {
    id: "mates-shelves",
    name: "Wooden EGG Mates",
    description: "Convenient side shelves that provide workspace while cooking. Folds down when not in use.",
    price: "From $129.99",
    url: "https://biggreenegg.com/products/wooden-egg-mates",
    category: "Tables & Stands",
    keywords: ["mates", "shelves", "side", "tables", "workspace", "wooden", "acacia"],
    compatibleWith: ["XL", "Large", "Medium"]
  },
  {
    id: "drip-pan",
    name: "Disposable Drip Pans",
    description: "Catches drippings for easy cleanup. Pack of 5 heavy-duty aluminum pans.",
    price: "$14.99",
    url: "https://biggreenegg.com/products/disposable-drip-pans",
    category: "Cookware & Tools",
    keywords: ["drip", "pan", "disposable", "aluminum", "cleanup", "catch", "grease"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  // Additional Lifestyle & Gear
  {
    id: "apron",
    name: "Big Green Egg Chef's Apron",
    description: "High-quality grilling apron with adjustable neck strap and multiple pockets for tools and accessories.",
    price: "$34.99",
    url: "https://biggreenegg.com/products/big-green-egg-chefs-apron",
    category: "Lifestyle & Gear",
    keywords: ["apron", "chef", "cooking", "grilling", "bbq", "clothing", "protection"]
  },
  {
    id: "cap",
    name: "Big Green Egg Baseball Cap",
    description: "Stylish cap with embroidered Big Green Egg logo. One size fits most with adjustable strap.",
    price: "$24.99",
    url: "https://biggreenegg.com/products/big-green-egg-baseball-cap",
    category: "Lifestyle & Gear",
    keywords: ["cap", "hat", "baseball", "apparel", "headwear"]
  },
  {
    id: "grill-light",
    name: "Flexible Grill Light",
    description: "Flexible LED light that attaches to your EGG for night-time grilling. Weather-resistant design.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/flexible-grill-light",
    category: "Lifestyle & Gear",
    keywords: ["light", "grill", "led", "flexible", "night", "cooking", "visibility"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "gloves",
    name: "EGGmitt BBQ Glove",
    description: "Heat-resistant glove for safely handling hot EGG components. Protects up to 450°F/232°C.",
    price: "$24.99",
    url: "https://biggreenegg.com/products/eggmitt-bbq-glove",
    category: "Lifestyle & Gear",
    keywords: ["glove", "mitt", "heat", "resistant", "protection", "safety", "handling"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "salt-pepper",
    name: "Big Green Egg Salt & Pepper Shakers",
    description: "Ceramic egg-shaped salt and pepper shakers in the classic Big Green Egg color.",
    price: "$19.99",
    url: "https://biggreenegg.com/products/big-green-egg-salt-pepper-shakers",
    category: "Lifestyle & Gear",
    keywords: ["salt", "pepper", "shakers", "ceramic", "seasoning", "tableware"]
  },
  {
    id: "cookbook",
    name: "Big Green Egg Cookbook",
    description: "Comprehensive cookbook with hundreds of recipes specifically designed for cooking on the EGG.",
    price: "$39.99",
    url: "https://biggreenegg.com/products/big-green-egg-cookbook",
    category: "Lifestyle & Gear",
    keywords: ["cookbook", "recipes", "book", "guide", "cooking", "instructions"]
  },
  {
    id: "cutting-board",
    name: "Big Green Egg Acacia Cutting Board",
    description: "Premium acacia wood cutting board with the Big Green Egg logo. Perfect for prepping and serving.",
    price: "$44.99",
    url: "https://biggreenegg.com/products/big-green-egg-acacia-cutting-board",
    category: "Lifestyle & Gear",
    keywords: ["cutting", "board", "acacia", "wood", "prep", "chop", "serve"]
  },
  
  // Additional Tables & Modular Systems
  {
    id: "custom-island-kit",
    name: "Custom Island Frame Kit for Large",
    description: "DIY frame kit to build your own custom island for your Large EGG. Includes frame, hardware, and instructions.",
    price: "$499.99",
    url: "https://biggreenegg.com/products/custom-island-frame-kit-for-large",
    category: "Tables & Stands",
    keywords: ["island", "frame", "kit", "custom", "build", "diy", "large"],
    compatibleWith: ["Large"]
  },
  {
    id: "custom-island-kit-xl",
    name: "Custom Island Frame Kit for XL",
    description: "DIY frame kit to build your own custom island for your XL EGG. Includes frame, hardware, and instructions.",
    price: "$549.99",
    url: "https://biggreenegg.com/products/custom-island-frame-kit-for-xl",
    category: "Tables & Stands",
    keywords: ["island", "frame", "kit", "custom", "build", "diy", "xl"],
    compatibleWith: ["XL"]
  },
  {
    id: "mahogany-table-large",
    name: "Table - Solid Mahogany for Large EGG",
    description: "Premium solid mahogany table for your Large EGG. Beautiful, weather-resistant, and built to last.",
    price: "$899.99",
    url: "https://biggreenegg.com/products/table-solid-mahogany-for-large-egg",
    category: "Tables & Stands",
    keywords: ["table", "mahogany", "large", "premium", "wood", "furniture"],
    compatibleWith: ["Large"]
  },
  {
    id: "cypress-table-xl",
    name: "Table - Solid Cypress for XL EGG",
    description: "Premium solid cypress table for your XL EGG. Natural resistance to weather and insects.",
    price: "$849.99",
    url: "https://biggreenegg.com/products/table-solid-cypress-for-xl-egg",
    category: "Tables & Stands",
    keywords: ["table", "cypress", "xl", "premium", "wood", "furniture"],
    compatibleWith: ["XL"]
  },
  {
    id: "modular-expansion-frame",
    name: "Modular Nest Expansion Frame",
    description: "Expand your modular nest system with this additional frame. Compatible with all inserts.",
    price: "$199.99",
    url: "https://biggreenegg.com/products/modular-nest-expansion-frame",
    category: "Modular Systems",
    keywords: ["modular", "expansion", "frame", "nest", "system", "add-on"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "modular-connector",
    name: "Modular Nest Connector Kit",
    description: "Connect multiple modular nest components securely with this hardware kit.",
    price: "$49.99",
    url: "https://biggreenegg.com/products/modular-nest-connector-kit",
    category: "Modular Systems",
    keywords: ["modular", "connector", "kit", "hardware", "nest", "system"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "teak-insert",
    name: "Solid Teak Insert for Modular Nest System",
    description: "Premium teak wood insert for the modular nest system. Natural oils make it weather resistant.",
    price: "$149.99",
    url: "https://biggreenegg.com/products/solid-teak-insert-for-modular-nest-system",
    category: "Modular Systems",
    keywords: ["teak", "insert", "modular", "premium", "wood", "nest"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "modular-tank-holder",
    name: "Propane Tank Holder for Modular Nest System",
    description: "Securely store your propane tank in this holder that integrates with the modular nest system.",
    price: "$79.99",
    url: "https://biggreenegg.com/products/propane-tank-holder-for-modular-nest-system",
    category: "Modular Systems",
    keywords: ["propane", "tank", "holder", "modular", "nest", "storage"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  
  // Additional Bases and Stands
  {
    id: "portable-nest",
    name: "Portable Nest for MiniMax EGG",
    description: "Folding stand designed specifically for the MiniMax EGG. Perfect for camping and tailgating.",
    price: "$89.99",
    url: "https://biggreenegg.com/products/portable-nest-for-minimax-egg",
    category: "Tables & Stands",
    keywords: ["portable", "nest", "stand", "minimax", "folding", "camping", "tailgating"],
    compatibleWith: ["MiniMax"]
  },
  {
    id: "table-nest",
    name: "Table Nest",
    description: "Raises your EGG off the table surface to prevent heat transfer and potential damage.",
    price: "From $29.99",
    url: "https://biggreenegg.com/products/table-nest",
    category: "Tables & Stands",
    keywords: ["table", "nest", "heat", "barrier", "protection", "raise"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax"]
  },
  {
    id: "rolling-cart",
    name: "Rolling Cart for Large EGG",
    description: "Heavy-duty rolling cart with locking wheels for your Large EGG. Includes storage space for accessories.",
    price: "$249.99",
    url: "https://biggreenegg.com/products/rolling-cart-for-large-egg",
    category: "Tables & Stands",
    keywords: ["rolling", "cart", "wheels", "mobile", "storage", "large"],
    compatibleWith: ["Large"]
  },
  {
    id: "nest-handler-2xl",
    name: "intEGGrated Nest+Handler for 2XL",
    description: "Heavy-duty nest with handles designed specifically for the 2XL EGG. Makes moving your EGG safe and easy.",
    price: "$299.99",
    url: "https://biggreenegg.com/products/integgrated-nest-handler-for-2xl",
    category: "Tables & Stands",
    keywords: ["integgrated", "nest", "handler", "2xl", "wheels", "mobile"],
    compatibleWith: ["2XL"]
  },
  
  // Additional Accessories
  {
    id: "dutch-oven",
    name: "Cast Iron Dutch Oven",
    description: "5.5 quart enameled cast iron Dutch oven perfect for stews, soups, and braising in your EGG.",
    price: "$129.99",
    url: "https://biggreenegg.com/products/cast-iron-dutch-oven",
    category: "Cookware & Tools",
    keywords: ["dutch", "oven", "cast", "iron", "cooking", "braising", "stew"],
    compatibleWith: ["2XL", "XL", "Large", "Medium"]
  },
  {
    id: "burger-press",
    name: "Cast Iron Burger Press",
    description: "Create perfect, uniform burgers with this heavy-duty cast iron press. Includes wooden handle.",
    price: "$24.99",
    url: "https://biggreenegg.com/products/cast-iron-burger-press",
    category: "Cookware & Tools",
    keywords: ["burger", "press", "cast", "iron", "patty", "maker"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "perforated-grid",
    name: "Perforated Cooking Grid",
    description: "Perfect for cooking smaller foods that might fall through a standard grid. Made of stainless steel.",
    price: "From $39.99",
    url: "https://biggreenegg.com/products/perforated-cooking-grid",
    category: "Ceramics & Grids",
    keywords: ["perforated", "grid", "cooking", "small", "food", "vegetables", "seafood"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"]
  },
  {
    id: "grill-rings",
    name: "Stainless Steel Grill Rings - Set of 4",
    description: "Perfect for stuffed peppers, onions, and other foods that need to stand upright while cooking.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/stainless-steel-grill-rings",
    category: "Cookware & Tools",
    keywords: ["grill", "rings", "stuffed", "peppers", "onions", "stainless", "steel"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "mesquite-chips",
    name: "Mesquite Smoking Chips",
    description: "Strong, earthy smoke flavor perfect for beef, pork, and game meats. Made from real mesquite wood.",
    price: "$14.99",
    url: "https://biggreenegg.com/products/mesquite-smoking-chips",
    category: "Charcoal, Wood & Starters",
    keywords: ["mesquite", "chips", "smoking", "wood", "flavor", "smoke", "strong"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "natural-starters",
    name: "Natural Charcoal Starters - 24 Count",
    description: "Chemical-free fire starters made from wood shavings and paraffin. Quick and easy lighting every time.",
    price: "$12.99",
    url: "https://biggreenegg.com/products/natural-charcoal-starters",
    category: "Charcoal, Wood & Starters",
    keywords: ["starters", "firestarters", "charcoal", "lighting", "natural", "chemical-free"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "ash-pan",
    name: "Stainless Steel Ash Pan",
    description: "Collects ash for easy cleanup. Slides under the firebox and easily removes for disposal.",
    price: "From $59.99",
    url: "https://biggreenegg.com/products/stainless-steel-ash-pan",
    category: "Covers & Cleaning",
    keywords: ["ash", "pan", "cleanup", "collection", "stainless", "steel", "clean"],
    compatibleWith: ["2XL", "XL", "Large", "Medium"]
  },
  {
    id: "grill-brush",
    name: "Dual-Action Grill Brush",
    description: "Dual-action brush with stainless steel bristles on one side and scraper on the other. Includes long handle for safety.",
    price: "$19.99",
    url: "https://biggreenegg.com/products/dual-action-grill-brush",
    category: "Covers & Cleaning",
    keywords: ["grill", "brush", "cleaning", "scraper", "bristles", "maintenance"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "covereg-2xl",
    name: "Premium EGG Cover for 2XL",
    description: "Heavy-duty weatherproof cover designed specifically for the 2XL EGG. Protects from elements and UV rays.",
    price: "$89.99",
    url: "https://biggreenegg.com/products/premium-egg-cover-for-2xl",
    category: "Covers & Cleaning",
    keywords: ["cover", "weatherproof", "protection", "2xl", "rain", "dust", "sun"],
    compatibleWith: ["2XL"]
  },
  {
    id: "cover-minimax",
    name: "Premium EGG Cover for MiniMax",
    description: "Heavy-duty weatherproof cover designed specifically for the MiniMax EGG. Protects from elements and UV rays.",
    price: "$49.99",
    url: "https://biggreenegg.com/products/premium-egg-cover-for-minimax",
    category: "Covers & Cleaning",
    keywords: ["cover", "weatherproof", "protection", "minimax", "rain", "dust", "sun"],
    compatibleWith: ["MiniMax"]
  },
  {
    id: "rotisserie",
    name: "EGGspander Rotisserie Kit",
    description: "Heavy-duty rotisserie system that works with the EGGspander. Perfect for whole chickens, roasts, and more.",
    price: "$249.99",
    url: "https://biggreenegg.com/products/eggspander-rotisserie-kit",
    category: "EGGspander System",
    keywords: ["rotisserie", "spit", "roast", "chicken", "turning", "eggspander", "attachment"],
    compatibleWith: ["2XL", "XL", "Large"]
  },
  {
    id: "half-moon-raised-grid",
    name: "Half Moon Raised Grid",
    description: "Creates a second level of cooking area on half of your EGG. Perfect for multi-zone cooking.",
    price: "From $49.99",
    url: "https://biggreenegg.com/products/half-moon-raised-grid",
    category: "EGGspander System",
    keywords: ["half moon", "raised", "grid", "second level", "multi-zone", "cooking", "space"],
    compatibleWith: ["XL", "Large", "Medium"]
  },
  
  // Additional Replacement Parts
  {
    id: "replacement-handle",
    name: "Replacement Wooden EGG Handle",
    description: "Original wooden handle replacement for your Big Green Egg.",
    price: "From $29.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-wooden-egg-handle",
    category: "Replacement Parts",
    keywords: ["handle", "wooden", "replacement", "dome", "lift", "part", "repair"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-hinge",
    name: "Replacement Hinge Assembly",
    description: "Heavy-duty replacement hinge assembly for your Big Green Egg.",
    price: "From $79.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-hinge-assembly",
    category: "Replacement Parts",
    keywords: ["hinge", "assembly", "replacement", "dome", "part", "repair", "spring"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-band",
    name: "Replacement Band Assembly",
    description: "Complete metal band assembly including hinges for your Big Green Egg.",
    price: "From $119.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-band-assembly",
    category: "Replacement Parts",
    keywords: ["band", "assembly", "replacement", "metal", "part", "repair", "hinge"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-damper-cap",
    name: "Replacement Dual-Function Metal Top",
    description: "Replacement daisy wheel and damper top for precise temperature control.",
    price: "From $49.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-dual-function-metal-top",
    category: "Replacement Parts",
    keywords: ["damper", "cap", "top", "daisy wheel", "temperature", "control", "vent", "replacement"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-cooking-grid",
    name: "Replacement Stainless Steel Cooking Grid",
    description: "Original replacement stainless steel cooking grid for your Big Green Egg.",
    price: "From $41.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-stainless-steel-cooking-grid",
    category: "Replacement Parts",
    keywords: ["cooking", "grid", "grate", "stainless", "steel", "replacement", "original"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  },
  {
    id: "replacement-draft-door",
    name: "Replacement Draft Door",
    description: "Replacement bottom vent door for airflow control on your Big Green Egg.",
    price: "From $24.99",
    url: "https://biggreenegg.com/collections/replacement-parts/products/replacement-draft-door",
    category: "Replacement Parts",
    keywords: ["draft", "door", "vent", "bottom", "airflow", "control", "replacement"],
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"]
  }
];

// Helper function to extract egg size from query
function getEggSizeFromQuery(query: string): string {
  const eggSizeVariations = [
    { variations: ["2xl", "2-xl", "2 xl", "xxl", "xx-large", "xxlarge", "2x large", "2xlarge", "2-extra large", "2-extra-large", "double extra large"], size: "2xl" },
    { variations: ["xl", "x-large", "x large", "xlarge", "x-l", "extra large", "extra-large", "extralarge", "xtra large", "xtra-large"], size: "xl" },
    { variations: ["large", "lg", "l"], size: "large" },
    { variations: ["medium", "med", "m"], size: "medium" },
    { variations: ["small", "sm", "s"], size: "small" },
    { variations: ["minimax", "mini max", "mini-max"], size: "minimax" },
    { variations: ["mini"], size: "mini" }
  ];
  
  let targetSize = "";
  
  // Check each variation group
  for (const sizeGroup of eggSizeVariations) {
    for (const variation of sizeGroup.variations) {
      if (query.includes(variation)) {
        targetSize = sizeGroup.size;
        break;
      }
    }
    if (targetSize) break;
  }
  
  return targetSize;
}

// Function to search for products based on user query
export function searchProducts(query: string, maxResults = 5): Product[] {
  const lowerQuery = query.toLowerCase();
  
  // Special case handling for common product searches
  if (lowerQuery.includes("egg genius") || lowerQuery.includes("temperature controller")) {
    return products.filter(p => p.id === "egg-genius");
  }
  
  if (lowerQuery.includes("pizza stone") || lowerQuery.includes("baking stone")) {
    const pizzaStones = products.filter(p => 
      (p.keywords.includes("pizza") && p.keywords.includes("stone")) || 
      p.id === "pizza-stone" || 
      p.id === "deep-dish-stone"
    );
    return pizzaStones.length > 0 ? pizzaStones : [];
  }
  
  if (lowerQuery.includes("eggspander") || lowerQuery.includes("expander") || lowerQuery.includes("multi level") || lowerQuery.includes("multilevel")) {
    const eggspanders = products.filter(p => p.id.includes("eggspander"));
    return eggspanders.length > 0 ? eggspanders : [];
  }
  
  if (lowerQuery.includes("fire bowl") || lowerQuery.includes("firebowl")) {
    return products.filter(p => p.id === "fire-bowl");
  }
  
  if (lowerQuery.includes("conveggtor") || lowerQuery.includes("plate setter") || lowerQuery.includes("heat deflector")) {
    return products.filter(p => p.id === "conveggtor");
  }
  
  if (lowerQuery.includes("charcoal") || lowerQuery.includes("lump")) {
    return products.filter(p => p.id === "premium-charcoal");
  }
  
  // Handle weight queries for different egg sizes
  if (lowerQuery.includes("weight") || lowerQuery.includes("how heavy") || lowerQuery.includes("how much does") || lowerQuery.includes("pounds") || lowerQuery.includes("lbs")) {
    const targetSize = getEggSizeFromQuery(lowerQuery);
    
    if (targetSize) {
      return products.filter(p => p.id.includes(targetSize) && p.category === "Eggs");
    }
    
    // If no specific size mentioned, return all eggs with their weights
    return products.filter(p => p.category === "Eggs" && p.specifications?.weight).slice(0, maxResults);
  }
  
  // Handle dimension queries
  if (lowerQuery.includes("dimension") || lowerQuery.includes("size") || lowerQuery.includes("how big") || lowerQuery.includes("how tall") || lowerQuery.includes("height") || lowerQuery.includes("width")) {
    const targetSize = getEggSizeFromQuery(lowerQuery);
    
    if (targetSize) {
      return products.filter(p => p.id.includes(targetSize) && p.specifications?.dimensions);
    }
    
    // If no specific size mentioned, return all eggs with their dimensions
    return products.filter(p => p.specifications?.dimensions).slice(0, maxResults);
  }
  
  // Handle cooking area queries
  if (lowerQuery.includes("cooking area") || lowerQuery.includes("cooking surface") || lowerQuery.includes("cooking space") || lowerQuery.includes("grid size") || lowerQuery.includes("how much can fit")) {
    const targetSize = getEggSizeFromQuery(lowerQuery);
    
    if (targetSize) {
      return products.filter(p => p.id.includes(targetSize) && p.specifications?.cookingArea);
    }
    
    // If no specific size mentioned, return all eggs with their cooking areas
    return products.filter(p => p.specifications?.cookingArea).slice(0, maxResults);
  }
  
  if (lowerQuery.includes("thermometer") || lowerQuery.includes("temperature probe")) {
    return products.filter(p => 
      p.id === "instant-thermometer" || 
      p.id === "wireless-thermometer" || 
      p.category === "Temperature Control"
    );
  }
  
  if (lowerQuery.includes("smoking chips") || lowerQuery.includes("wood chips")) {
    return products.filter(p => 
      p.id === "whiskey-chips" || 
      p.id === "hickory-chips" || 
      p.id === "apple-chips"
    );
  }
  
  if (lowerQuery.includes("grid") || lowerQuery.includes("grill grate")) {
    return products.filter(p => 
      p.id === "stainless-grid" || 
      p.id === "half-grid" || 
      p.id === "cast-iron-grid"
    );
  }
  
  if (lowerQuery.includes("table") || lowerQuery.includes("acacia")) {
    return products.filter(p => 
      p.id === "acacia-table-large" || 
      p.id === "acacia-table-xl" || 
      p.category === "Tables & Stands"
    );
  }
  
  // Score each product based on keyword matches and name/description similarity
  const scoredProducts = products.map(product => {
    let score = 0;
    
    // Check for exact name match (highest priority)
    if (product.name.toLowerCase() === lowerQuery) {
      score += 100;
    }
    
    // Check if query is contained in the name
    if (product.name.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }
    
    // Check if query is contained in the description
    if (product.description.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }
    
    // Check for keyword matches
    product.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 10;
      }
      
      // Check if any keyword is contained in the query
      if (keyword.length > 3 && lowerQuery.includes(keyword.toLowerCase())) {
        score += 15;
      }
    });
    
    // Check for category match
    if (product.category.toLowerCase().includes(lowerQuery)) {
      score += 20;
    }
    
    // Check for specifications matches if available
    if (product.specifications) {
      // Check weight
      if (product.specifications.weight && 
          (lowerQuery.includes("weight") || lowerQuery.includes("heavy") || lowerQuery.includes("pounds") || lowerQuery.includes("lbs")) && 
          product.specifications.weight.toLowerCase().includes(lowerQuery.replace(/weight|heavy|pounds|lbs|how much does|weigh/g, "").trim())) {
        score += 40;
      }
      
      // Check dimensions
      if (product.specifications.dimensions && 
          (lowerQuery.includes("dimension") || lowerQuery.includes("size") || lowerQuery.includes("how big") || lowerQuery.includes("height") || lowerQuery.includes("width"))) {
        score += 25;
      }
      
      // Check cooking area
      if (product.specifications.cookingArea && 
          (lowerQuery.includes("cooking area") || lowerQuery.includes("cooking surface") || lowerQuery.includes("how much can fit"))) {
        score += 35;
      }
      
      // Check features
      if (product.specifications.features) {
        product.specifications.features.forEach(feature => {
          if (lowerQuery.includes(feature.toLowerCase())) {
            score += 20;
          }
        });
      }
    }
    
    // Check for word matches in name
    const queryWords = lowerQuery.split(/\s+/);
    const nameWords = product.name.toLowerCase().split(/\s+/);
    
    queryWords.forEach(word => {
      if (word.length > 3 && nameWords.includes(word)) {
        score += 5;
      }
    });
    
    // Boost score for products that match "buy" or "purchase" intent
    if ((lowerQuery.includes("buy") || lowerQuery.includes("purchase") || lowerQuery.includes("want")) && 
        (product.name.toLowerCase().includes(lowerQuery.replace(/buy|purchase|want|get|need/g, "").trim()))) {
      score += 40;
    }
    
    return { product, score };
  });
  
  // Sort by score (descending) and return top results
  return scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.product);
}

// Function to generate a response from product matches
export function generateProductResponse(products: Product[]): string {
  if (products.length === 0) {
    return "I couldn't find any specific products matching your request. You can browse all our products at [Big Green Egg](https://biggreenegg.com/collections). Would you like me to help you find something specific?";
  }
  
  if (products.length === 1) {
    const product = products[0];
    let response = `**[${product.name}](${product.url})** - ${product.price}\n\n${product.description}\n\n`;
    
    // Add specifications if available
    if (product.specifications) {
      response += "**Specifications:**\n";
      
      if (product.specifications.weight) {
        response += `- **Weight:** ${product.specifications.weight}\n`;
      }
      
      if (product.specifications.dimensions) {
        response += `- **Dimensions:** ${product.specifications.dimensions}\n`;
      }
      
      if (product.specifications.cookingArea) {
        response += `- **Cooking Area:** ${product.specifications.cookingArea}\n`;
      }
      
      if (product.specifications.cookingGrid) {
        response += `- **Cooking Grid:** ${product.specifications.cookingGrid}\n`;
      }
      
      if (product.specifications.maxTemp) {
        response += `- **Maximum Temperature:** ${product.specifications.maxTemp}\n`;
      }
      
      if (product.specifications.features && product.specifications.features.length > 0) {
        response += "\n**Features:**\n";
        product.specifications.features.forEach(feature => {
          response += `- ${feature}\n`;
        });
      }
      
      response += "\n";
    }
    
    response += "Would you like more information about this product or would you like to see other options?";
    
    return response;
  }
  
  // Multiple matches
  let response = "Here are some products that might interest you:\n\n";
  
  products.forEach((product, index) => {
    response += `**[${product.name}](${product.url})** - ${product.price}\n${product.description}\n\n`;
    
    // Add key specifications for multiple products (simplified version)
    if (product.specifications) {
      if (product.specifications.weight || product.specifications.dimensions || product.specifications.cookingArea) {
        response += "**Key Specs:** ";
        
        if (product.specifications.weight) {
          response += `Weight: ${product.specifications.weight.split(' ')[0]} lbs | `;
        }
        
        if (product.specifications.cookingArea) {
          response += `Cooking Area: ${product.specifications.cookingArea.split(' ')[0]} sq in | `;
        }
        
        // Remove trailing separator
        response = response.replace(/ \| $/, "");
        response += "\n\n";
      }
    }
  });
  
  response += "Would you like more detailed information about any of these products?";
  
  return response;
} 