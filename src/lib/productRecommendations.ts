// Product recommendation types
export interface Product {
  name: string;
  description: string;
  price: string;
  url: string;
  imageUrl?: string;
  category: string;
  compatibleWith?: string[]; // EGG sizes this product is compatible with
  relatedProducts?: string[]; // Names of related products
}

export interface ProductBundle {
  name: string;
  description: string;
  products: Product[];
  totalPrice: string;
  discount?: string;
  category: string;
}

// EGG size recommendation based on household size and cooking needs
export interface EggSizeRecommendation {
  size: string;
  recommendedFor: string;
  price: string;
  url: string;
  description: string;
}

// Product database
export const products: Record<string, Product> = {
  "2XL-EGG": {
    name: "2XL Big Green Egg",
    description:
      "Our largest EGG, perfect for large gatherings and commercial use. Can cook up to 20 steaks at once.",
    price: "$2,649.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/2xl-big-green-egg",
    category: "egg",
    compatibleWith: ["2XL"],
  },
  "XL-EGG": {
    name: "XL Big Green Egg",
    description:
      "Perfect for larger families and entertaining. Can cook two 20-pound turkeys at once.",
    price: "$1,599.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/xl-big-green-egg",
    category: "egg",
    compatibleWith: ["XL"],
  },
  "LARGE-EGG": {
    name: "Large Big Green Egg",
    description:
      "Our most popular size, perfect for most families. Versatile for everything from appetizers to entrees.",
    price: "$1,149.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/large-big-green-egg",
    category: "egg",
    compatibleWith: ["Large"],
  },
  "MEDIUM-EGG": {
    name: "Medium Big Green Egg",
    description:
      "Perfect for smaller families or limited spaces. Still provides plenty of cooking area.",
    price: "$839.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/medium-big-green-egg",
    category: "egg",
    compatibleWith: ["Medium"],
  },
  "SMALL-EGG": {
    name: "Small Big Green Egg",
    description:
      "Great for individuals, couples, or small spaces like balconies and small patios.",
    price: "$689.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/small-big-green-egg",
    category: "egg",
    compatibleWith: ["Small"],
  },
  "MINIMAX-EGG": {
    name: "MiniMax Big Green Egg",
    description:
      "Portable yet powerful. Perfect for tailgating, camping, or small patios.",
    price: "$734.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/minimax-big-green-egg",
    category: "egg",
    compatibleWith: ["MiniMax"],
  },
  "MINI-EGG": {
    name: "Mini Big Green Egg",
    description:
      "Our most portable option. Perfect for camping, picnics, or table-top cooking.",
    price: "$489.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages/products/mini-big-green-egg",
    category: "egg",
    compatibleWith: ["Mini"],
  },
  "PIZZA-STONE": {
    name: "Pizza & Baking Stone",
    description:
      "Produces perfectly crisp crusts and acts as a heat diffuser for baking and roasting.",
    price: "$69.99",
    url: "https://biggreenegg.com/collections/pizza/products/pizza-baking-stone",
    category: "pizza",
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"],
    relatedProducts: ["PIZZA-OVEN-WEDGE", "PIZZA-PEEL", "PIZZA-CUTTER"],
  },
  "PIZZA-OVEN-WEDGE": {
    name: "Pizza Oven Wedge for Large EGG",
    description:
      "Creates the perfect environment for cooking pizzas with crispy crusts and perfectly melted toppings.",
    price: "$119.99",
    url: "https://biggreenegg.com/collections/pizza/products/pizza-oven-wedge-for-large-egg",
    category: "pizza",
    compatibleWith: ["Large"],
    relatedProducts: ["PIZZA-STONE", "PIZZA-PEEL", "PIZZA-CUTTER"],
  },
  "PIZZA-PEEL": {
    name: "Aluminum Pizza Peel",
    description: "Essential tool for sliding pizzas in and out of your EGG.",
    price: "$39.99",
    url: "https://biggreenegg.com/collections/pizza/products/aluminum-pizza-peel",
    category: "pizza",
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"],
    relatedProducts: ["PIZZA-STONE", "PIZZA-OVEN-WEDGE", "PIZZA-CUTTER"],
  },
  "PIZZA-CUTTER": {
    name: "Pizza Cutter Wheel",
    description:
      "Stainless steel wheel for clean, precise cuts through your pizza.",
    price: "$24.99",
    url: "https://biggreenegg.com/collections/pizza/products/pizza-cutter-wheel",
    category: "pizza",
    compatibleWith: [
      "2XL",
      "XL",
      "Large",
      "Medium",
      "Small",
      "MiniMax",
      "Mini",
    ],
    relatedProducts: ["PIZZA-STONE", "PIZZA-OVEN-WEDGE", "PIZZA-PEEL"],
  },
  "EGG-GENIUS": {
    name: "EGG Genius Temperature Controller",
    description:
      "Monitor and adjust your EGG's temperature remotely for perfect results every time.",
    price: "$249.99",
    url: "https://biggreenegg.com/collections/temperature-control/products/egg-genius-temperature-controller",
    category: "temperature_control",
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"],
    relatedProducts: ["INFRARED-THERMOMETER", "INSTANT-READ-THERMOMETER"],
  },
  "EGGSPANDER-XL": {
    name: "5-Piece EGGspander Kit for XL",
    description:
      "Versatile system that allows you to cook multiple dishes at different temperatures simultaneously.",
    price: "$349.99",
    url: "https://biggreenegg.com/collections/eggspander-system/products/5-piece-eggspander-kit-for-xl",
    category: "cooking_system",
    compatibleWith: ["XL"],
    relatedProducts: ["HALF-GRID-XL", "CAST-IRON-GRID"],
  },
  "EGGSPANDER-LARGE": {
    name: "5-Piece EGGspander Kit for Large",
    description:
      "Versatile system that allows you to cook multiple dishes at different temperatures simultaneously.",
    price: "$329.99",
    url: "https://biggreenegg.com/collections/eggspander-system/products/5-piece-eggspander-kit-for-large",
    category: "cooking_system",
    compatibleWith: ["Large"],
    relatedProducts: ["HALF-GRID-LARGE", "CAST-IRON-GRID"],
  },
  "FIRE-BOWL": {
    name: "Stainless Steel Fire Bowl",
    description:
      "Improves airflow and makes cleanup easier, extending the life of your ceramic fire box.",
    price: "$84.99",
    url: "https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-fire-bowl",
    category: "replacement_parts",
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small"],
  },
  "HALF-GRID-LARGE": {
    name: "Stainless Steel Half Grid for Large",
    description:
      "Gives you more flexibility in your cooking setup. Perfect for creating different temperature zones.",
    price: "$32.99",
    url: "https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-half-grid",
    category: "cooking_surface",
    compatibleWith: ["Large"],
    relatedProducts: ["CAST-IRON-GRID", "EGGSPANDER-LARGE"],
  },
  "GRID-LARGE": {
    name: "Stainless Steel Grid for Large",
    description:
      "Durable stainless steel grid provides excellent heat retention and is built to last.",
    price: "$41.99",
    url: "https://biggreenegg.com/collections/ceramics-grids/products/stainless-steel-grid",
    category: "cooking_surface",
    compatibleWith: ["Large"],
    relatedProducts: ["CAST-IRON-GRID", "HALF-GRID-LARGE"],
  },
  "WHISKEY-CHIPS": {
    name: "Premium Whiskey Barrel Smoking Chips",
    description:
      "Made from genuine whiskey barrels and impart a unique, rich flavor to your smoked foods.",
    price: "$14.99",
    url: "https://biggreenegg.com/collections/charcoal-wood-starters/products/premium-whiskey-barrel-smoking-chips-2-9-l-180-cu-in",
    category: "smoking",
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax"],
    relatedProducts: ["APPLE-CHIPS", "HICKORY-CHIPS"],
  },
  "APPLE-CHIPS": {
    name: "Apple Smoking Chips",
    description:
      "Mild, sweet smoking chips perfect for poultry, pork and fish. Adds delicate fruity flavor to foods.",
    price: "$14.99",
    url: "https://biggreenegg.com/collections/charcoal-wood-starters/products/apple-smoking-chips-2-9-l-180-cu-in",
    category: "smoking",
    compatibleWith: [
      "2XL",
      "XL",
      "Large",
      "Medium",
      "Small",
      "MiniMax",
      "Mini",
    ],
    relatedProducts: ["WHISKEY-CHIPS", "HICKORY-CHIPS"],
  },
  "HICKORY-CHIPS": {
    name: "Hickory Smoking Chips",
    description:
      "Classic smoking chips that add rich, savory flavor to foods. Perfect for pork, chicken, beef and cheese.",
    price: "$14.99",
    url: "https://biggreenegg.com/collections/charcoal-wood-starters/products/hickory-smoking-chips-2-9-l-180-cu-in",
    category: "smoking",
    compatibleWith: [
      "2XL",
      "XL",
      "Large",
      "Medium",
      "Small",
      "MiniMax",
      "Mini",
    ],
    relatedProducts: ["WHISKEY-CHIPS", "APPLE-CHIPS"],
  },
  "BRISKET-KNIFE": {
    name: 'Brisket Knife 12" Stainless Steel',
    description:
      "Features a Granton edge that creates small air pockets between the blade and the food, perfect for slicing through smoked meats.",
    price: "$29.99",
    url: "https://biggreenegg.com/products/brisket-knife-12-stainless-steel",
    category: "tools",
    compatibleWith: [
      "2XL",
      "XL",
      "Large",
      "Medium",
      "Small",
      "MiniMax",
      "Mini",
    ],
    relatedProducts: ["MEAT-CLAWS", "CARVING-BOARD"],
  },
  "ACACIA-TABLE-LARGE": {
    name: "Acacia Hardwood Table for Large EGG",
    description:
      "Beautiful, durable option that provides ample workspace for your Large EGG.",
    price: "$659.99",
    url: "https://biggreenegg.com/collections/all-modular-system-tables-stands/products/table-solid-acacia-hardwood-for-large-egg",
    category: "tables",
    compatibleWith: ["Large"],
    relatedProducts: ["TABLE-COVER-LARGE", "TABLE-NEST"],
  },
  "TABLE-COVER-LARGE": {
    name: "Premium Cover for Acacia Table with Large EGG",
    description:
      "Specifically designed to fit the Acacia table with a Large EGG installed.",
    price: "$82.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-e-fits-acacia-table-for-l",
    category: "covers",
    compatibleWith: ["Large"],
    relatedProducts: ["ACACIA-TABLE-LARGE", "EGG-COVER-LARGE"],
  },
  "EGG-COVER-MINI": {
    name: "Cover G - Fits MX and MN with or without a carrier",
    description:
      "Weather-resistant cover specifically designed to protect your Mini or MiniMax EGG from the elements.",
    price: "$42.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-g-fits-mx-and-mn-with-or-without-a-carrier",
    category: "covers",
    compatibleWith: ["Mini", "MiniMax"],
    relatedProducts: [],
  },
  "EGG-COVER-SMALL": {
    name: "Cover F - Fits Built-Ins, Modular Nests or Cooking Islands for XL and L EGG Domes",
    description:
      "Weather-resistant cover specifically designed to protect your EGG dome.",
    price: "$55.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-f-fits-built-ins-modular-nests-or-cooking-islands-for-xl-and-l-egg-domes",
    category: "covers",
    compatibleWith: ["Small", "Medium", "Large", "XL"],
    relatedProducts: [],
  },
  "EGG-COVER-MEDIUM": {
    name: "Cover F - Fits Built-Ins, Modular Nests or Cooking Islands for XL and L EGG Domes",
    description:
      "Weather-resistant cover specifically designed to protect your EGG dome.",
    price: "$55.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-f-fits-built-ins-modular-nests-or-cooking-islands-for-xl-and-l-egg-domes",
    category: "covers",
    compatibleWith: ["Medium", "Large", "XL"],
    relatedProducts: [],
  },
  "EGG-COVER-LARGE": {
    name: "Cover F - Fits Built-Ins, Modular Nests or Cooking Islands for XL and L EGG Domes",
    description:
      "Weather-resistant cover specifically designed to protect your Large EGG dome.",
    price: "$55.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-f-fits-built-ins-modular-nests-or-cooking-islands-for-xl-and-l-egg-domes",
    category: "covers",
    compatibleWith: ["Large"],
    relatedProducts: ["TABLE-COVER-LARGE"],
  },
  "EGG-COVER-XL": {
    name: "Cover F - Fits Built-Ins, Modular Nests or Cooking Islands for XL and L EGG Domes",
    description:
      "Weather-resistant cover specifically designed to protect your XL EGG dome.",
    price: "$55.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-f-fits-built-ins-modular-nests-or-cooking-islands-for-xl-and-l-egg-domes",
    category: "covers",
    compatibleWith: ["XL"],
    relatedProducts: [],
  },
  "EGG-COVER-2XL": {
    name: "Cover F - Fits Built-Ins, Modular Nests or Cooking Islands for XL and L EGG Domes",
    description:
      "Weather-resistant cover specifically designed to protect your 2XL EGG dome.",
    price: "$55.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-f-fits-built-ins-modular-nests-or-cooking-islands-for-xl-and-l-egg-domes",
    category: "covers",
    compatibleWith: ["2XL"],
    relatedProducts: [],
  },
  "NEST-COVER-MINI": {
    name: "Cover G - Fits MX and MN with or without a carrier",
    description:
      "Weather-resistant cover specifically designed to protect your Mini or MiniMax EGG with Carrier.",
    price: "$42.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-g-fits-mx-and-mn-with-or-without-a-carrier",
    category: "covers",
    compatibleWith: ["Mini", "MiniMax"],
    relatedProducts: [],
  },
  "NEST-COVER-SMALL": {
    name: "Cover H - for Nest, Handler, and Portable Nest for M, S, MX",
    description:
      "Weather-resistant cover specifically designed to protect your Small EGG with Nest stand.",
    price: "$74.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-h-for-nest-handler-and-portable-nest-for-m-s-mx",
    category: "covers",
    compatibleWith: ["Small", "Medium", "MiniMax"],
    relatedProducts: [],
  },
  "NEST-COVER-MEDIUM": {
    name: "Cover H - for Nest, Handler, and Portable Nest for M, S, MX",
    description:
      "Weather-resistant cover specifically designed to protect your Medium EGG with Nest stand.",
    price: "$74.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-h-for-nest-handler-and-portable-nest-for-m-s-mx",
    category: "covers",
    compatibleWith: ["Medium", "Small", "MiniMax"],
    relatedProducts: [],
  },
  "NEST-COVER-LARGE": {
    name: "Cover B - Fits Nest and Handler for XL, L & Modular Nest for M",
    description:
      "Weather-resistant cover specifically designed to protect your Large EGG with Nest or Handler.",
    price: "$74.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-b-fits-nest-and-handler-for-xl-l-modular-nest-for-m",
    category: "covers",
    compatibleWith: ["Large", "XL", "Medium"],
    relatedProducts: [],
  },
  "NEST-COVER-XL": {
    name: "Cover B - Fits Nest and Handler for XL, L & Modular Nest for M",
    description:
      "Weather-resistant cover specifically designed to protect your XL EGG with Nest or Handler.",
    price: "$74.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-b-fits-nest-and-handler-for-xl-l-modular-nest-for-m",
    category: "covers",
    compatibleWith: ["XL", "Large", "Medium"],
    relatedProducts: [],
  },
  "NEST-COVER-2XL": {
    name: "Cover I - Fits Nest and Handler or Nest for 2XL",
    description:
      "Weather-resistant cover specifically designed to protect your 2XL EGG with Nest stand.",
    price: "$74.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-i-fits-nest-and-handler-or-nest-for-2xl",
    category: "covers",
    compatibleWith: ["2XL"],
    relatedProducts: [],
  },
  "MODULAR-COVER-LARGE": {
    name: "Cover A - Fits Modular Nest for 2XL, XL and L",
    description:
      "Weather-resistant cover specifically designed to protect your Large EGG with Modular Nest.",
    price: "$79.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-a-fits-modular-nest-for-2xl-xl-and-l",
    category: "covers",
    compatibleWith: ["Large", "XL", "2XL"],
    relatedProducts: [],
  },
  "MODULAR-COVER-XL": {
    name: "Cover A - Fits Modular Nest for 2XL, XL and L",
    description:
      "Weather-resistant cover specifically designed to protect your XL EGG with Modular Nest.",
    price: "$79.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-a-fits-modular-nest-for-2xl-xl-and-l",
    category: "covers",
    compatibleWith: ["XL", "Large", "2XL"],
    relatedProducts: [],
  },
  "MODULAR-COVER-2XL": {
    name: "Cover A - Fits Modular Nest for 2XL, XL and L",
    description:
      "Weather-resistant cover specifically designed to protect your 2XL EGG with Modular Nest.",
    price: "$79.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-a-fits-modular-nest-for-2xl-xl-and-l",
    category: "covers",
    compatibleWith: ["2XL", "XL", "Large"],
    relatedProducts: [],
  },
  "EXPANSION-COVER-MEDIUM": {
    name: "Cover C - Fits Modular Nest + Expansion Frame for XL, L and M, Acacia Table for XL",
    description:
      "Weather-resistant cover specifically designed to protect your Medium EGG with Modular Nest and Expansion Frame.",
    price: "$92.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-c-fits-modular-nest-expansion-frame-for-xl-l-and-m-acacia-table-for-xl",
    category: "covers",
    compatibleWith: ["Medium", "Large", "XL"],
    relatedProducts: [],
  },
  "EXPANSION-COVER-LARGE": {
    name: "Cover C - Fits Modular Nest + Expansion Frame for XL, L and M, Acacia Table for XL",
    description:
      "Weather-resistant cover specifically designed to protect your Large EGG with Modular Nest and Expansion Frame.",
    price: "$92.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-c-fits-modular-nest-expansion-frame-for-xl-l-and-m-acacia-table-for-xl",
    category: "covers",
    compatibleWith: ["Large", "Medium", "XL"],
    relatedProducts: [],
  },
  "EXPANSION-COVER-XL": {
    name: "Cover C - Fits Modular Nest + Expansion Frame for XL, L and M, Acacia Table for XL",
    description:
      "Weather-resistant cover specifically designed to protect your XL EGG with Modular Nest and Expansion Frame or Acacia Table.",
    price: "$92.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-c-fits-modular-nest-expansion-frame-for-xl-l-and-m-acacia-table-for-xl",
    category: "covers",
    compatibleWith: ["XL", "Large", "Medium"],
    relatedProducts: [],
  },
  "COOKING-ISLAND-COVER-LARGE": {
    name: 'Cover D - Fits 49" Cooking Island for XL and L',
    description:
      'Weather-resistant cover specifically designed to protect your Large EGG with 49" Cooking Island.',
    price: "$82.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-d-fits-49-cooking-island-for-xl-and-l",
    category: "covers",
    compatibleWith: ["Large", "XL"],
    relatedProducts: [],
  },
  "COOKING-ISLAND-COVER-XL": {
    name: 'Cover D - Fits 49" Cooking Island for XL and L',
    description:
      'Weather-resistant cover specifically designed to protect your XL EGG with 49" Cooking Island.',
    price: "$82.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-d-fits-49-cooking-island-for-xl-and-l",
    category: "covers",
    compatibleWith: ["XL", "Large"],
    relatedProducts: [],
  },
  "MODERN-TABLE-COVER-LARGE-53": {
    name: 'Cover K - L and XL for 53" Modern Table',
    description:
      'Weather-resistant cover specifically designed to protect your Large EGG with 53" Modern Table.',
    price: "$99.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-k-l-and-xl-for-53-modern-table",
    category: "covers",
    compatibleWith: ["Large", "XL"],
    relatedProducts: [],
  },
  "MODERN-TABLE-COVER-XL-53": {
    name: 'Cover K - L and XL for 53" Modern Table',
    description:
      'Weather-resistant cover specifically designed to protect your XL EGG with 53" Modern Table.',
    price: "$99.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-k-l-and-xl-for-53-modern-table",
    category: "covers",
    compatibleWith: ["XL", "Large"],
    relatedProducts: [],
  },
  "MODERN-TABLE-COVER-LARGE-72": {
    name: 'Cover L - L and XL for 72" Modern Table',
    description:
      'Weather-resistant cover specifically designed to protect your Large EGG with 72" Modern Table.',
    price: "$109.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-l-l-and-xl-for-72-modern-table",
    category: "covers",
    compatibleWith: ["Large", "XL"],
    relatedProducts: [],
  },
  "MODERN-TABLE-COVER-XL-72": {
    name: 'Cover L - L and XL for 72" Modern Table',
    description:
      'Weather-resistant cover specifically designed to protect your XL EGG with 72" Modern Table.',
    price: "$109.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-l-l-and-xl-for-72-modern-table",
    category: "covers",
    compatibleWith: ["XL", "Large"],
    relatedProducts: [],
  },
  "COOKING-ISLAND-COVER-LARGE-76": {
    name: 'Cover J - Fits 76" Cooking Island for XL and L',
    description:
      'Weather-resistant cover specifically designed to protect your Large EGG with 76" Cooking Island.',
    price: "$109.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-j-fits-76-cooking-island-for-xl-and-l",
    category: "covers",
    compatibleWith: ["Large", "XL"],
    relatedProducts: [],
  },
  "COOKING-ISLAND-COVER-XL-76": {
    name: 'Cover J - Fits 76" Cooking Island for XL and L',
    description:
      'Weather-resistant cover specifically designed to protect your XL EGG with 76" Cooking Island.',
    price: "$109.99",
    url: "https://biggreenegg.com/collections/covers-cleaning/products/cover-j-fits-76-cooking-island-for-xl-and-l",
    category: "covers",
    compatibleWith: ["XL", "Large"],
    relatedProducts: [],
  },
};

// Product bundles
export const productBundles: Record<string, ProductBundle> = {
  "PIZZA-BUNDLE": {
    name: "Complete Pizza Making Bundle",
    description:
      "Everything you need to make restaurant-quality pizzas at home.",
    products: [
      products["PIZZA-STONE"],
      products["PIZZA-OVEN-WEDGE"],
      products["PIZZA-PEEL"],
      products["PIZZA-CUTTER"],
    ],
    totalPrice: "$239.99", // Discounted from $254.96
    discount: "Save $14.97",
    category: "pizza",
  },
  "SMOKING-BUNDLE": {
    name: "Premium Smoking Bundle",
    description:
      "Essential tools and accessories for smoking meats to perfection.",
    products: [
      products["WHISKEY-CHIPS"],
      products["BRISKET-KNIFE"],
      products["EGG-GENIUS"],
    ],
    totalPrice: "$279.99", // Discounted from $294.97
    discount: "Save $14.98",
    category: "smoking",
  },
  "LARGE-EGG-STARTER": {
    name: "Large EGG Starter Package",
    description:
      "Everything you need to get started with your Large Big Green Egg.",
    products: [
      products["LARGE-EGG"],
      products["ACACIA-TABLE-LARGE"],
      products["TABLE-COVER-LARGE"],
    ],
    totalPrice: "$1,799.99", // Discounted from $1,892.97
    discount: "Save $92.98",
    category: "egg",
  },
};

// EGG size recommendations based on household size and cooking needs
export const eggSizeRecommendations: Record<string, EggSizeRecommendation> = {
  "SINGLE-PERSON": {
    size: "Mini or MiniMax",
    recommendedFor: "Single person or couple, limited space, portability",
    price: "From $489.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages",
    description:
      "The Mini and MiniMax EGGs are perfect for individuals, small spaces like apartments or balconies, and those who want portability for camping or tailgating.",
  },
  "SMALL-FAMILY": {
    size: "Small or Medium",
    recommendedFor: "Small family (2-3 people), limited space",
    price: "From $689.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages",
    description:
      "The Small and Medium EGGs are ideal for small families, cooking for 2-3 people, and those with limited outdoor space who still want the full BGE experience.",
  },
  "AVERAGE-FAMILY": {
    size: "Large",
    recommendedFor: "Average family (3-5 people), most versatile",
    price: "From $1,149.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages",
    description:
      "Our most popular size, the Large EGG is perfect for most families. It offers versatility for cooking everything from appetizers to entrees for 3-5 people.",
  },
  "LARGE-FAMILY": {
    size: "XL",
    recommendedFor: "Large family (5-8 people), frequent entertaining",
    price: "From $1,599.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages",
    description:
      "The XL EGG is perfect for larger families and those who entertain frequently. It can cook two 20-pound turkeys at once and is ideal for feeding 5-8 people.",
  },
  COMMERCIAL: {
    size: "2XL",
    recommendedFor: "Very large gatherings, commercial use",
    price: "From $2,649.99",
    url: "https://biggreenegg.com/collections/all-eggs-egg-packages",
    description:
      "Our largest EGG, the 2XL is perfect for very large gatherings, commercial use, and serious enthusiasts. It can cook up to 20 steaks at once.",
  },
};

// Function to recommend products based on user query
export function getProductRecommendations(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  const recommendations: Product[] = [];

  // Special case for direct cover queries
  if (lowerQuery.includes("cover")) {
    // Special case for table covers
    if (
      (lowerQuery.includes("large") && lowerQuery.includes("acacia")) ||
      (lowerQuery.includes("large") && lowerQuery.includes("table"))
    ) {
      recommendations.push(products["TABLE-COVER-LARGE"]);
      return recommendations;
    }

    // Special case for nest/stand covers
    if (
      lowerQuery.includes("large") &&
      (lowerQuery.includes("nest") || lowerQuery.includes("stand"))
    ) {
      recommendations.push(products["NEST-COVER-LARGE"]);
      return recommendations;
    }
    if (
      lowerQuery.includes("xl") &&
      (lowerQuery.includes("nest") || lowerQuery.includes("stand"))
    ) {
      recommendations.push(products["NEST-COVER-XL"]);
      return recommendations;
    }
    if (
      lowerQuery.includes("2xl") &&
      (lowerQuery.includes("nest") || lowerQuery.includes("stand"))
    ) {
      recommendations.push(products["NEST-COVER-2XL"]);
      return recommendations;
    }
    if (
      lowerQuery.includes("medium") &&
      (lowerQuery.includes("nest") || lowerQuery.includes("stand"))
    ) {
      recommendations.push(products["NEST-COVER-MEDIUM"]);
      return recommendations;
    }
    if (
      lowerQuery.includes("small") &&
      (lowerQuery.includes("nest") || lowerQuery.includes("stand"))
    ) {
      recommendations.push(products["NEST-COVER-SMALL"]);
      return recommendations;
    }
    if (
      (lowerQuery.includes("mini") || lowerQuery.includes("minimax")) &&
      (lowerQuery.includes("nest") ||
        lowerQuery.includes("stand") ||
        lowerQuery.includes("carrier"))
    ) {
      recommendations.push(products["NEST-COVER-MINI"]);
      return recommendations;
    }

    // Special case for modular covers
    if (lowerQuery.includes("modular") && lowerQuery.includes("expansion")) {
      if (lowerQuery.includes("xl")) {
        recommendations.push(products["EXPANSION-COVER-XL"]);
        return recommendations;
      } else if (lowerQuery.includes("large")) {
        recommendations.push(products["EXPANSION-COVER-LARGE"]);
        return recommendations;
      } else if (lowerQuery.includes("medium")) {
        recommendations.push(products["EXPANSION-COVER-MEDIUM"]);
        return recommendations;
      }
    }

    if (lowerQuery.includes("modular")) {
      if (lowerQuery.includes("2xl")) {
        recommendations.push(products["MODULAR-COVER-2XL"]);
        return recommendations;
      } else if (lowerQuery.includes("xl")) {
        recommendations.push(products["MODULAR-COVER-XL"]);
        return recommendations;
      } else if (lowerQuery.includes("large")) {
        recommendations.push(products["MODULAR-COVER-LARGE"]);
        return recommendations;
      }
    }

    // Special case for modern table covers
    if (lowerQuery.includes("modern") && lowerQuery.includes("53")) {
      if (lowerQuery.includes("xl")) {
        recommendations.push(products["MODERN-TABLE-COVER-XL-53"]);
        return recommendations;
      } else if (lowerQuery.includes("large")) {
        recommendations.push(products["MODERN-TABLE-COVER-LARGE-53"]);
        return recommendations;
      }
    }

    if (lowerQuery.includes("modern") && lowerQuery.includes("72")) {
      if (lowerQuery.includes("xl")) {
        recommendations.push(products["MODERN-TABLE-COVER-XL-72"]);
        return recommendations;
      } else if (lowerQuery.includes("large")) {
        recommendations.push(products["MODERN-TABLE-COVER-LARGE-72"]);
        return recommendations;
      }
    }

    // Special case for cooking island covers
    if (
      lowerQuery.includes("cooking") &&
      lowerQuery.includes("island") &&
      lowerQuery.includes("49")
    ) {
      if (lowerQuery.includes("xl")) {
        recommendations.push(products["COOKING-ISLAND-COVER-XL"]);
        return recommendations;
      } else if (lowerQuery.includes("large")) {
        recommendations.push(products["COOKING-ISLAND-COVER-LARGE"]);
        return recommendations;
      }
    }

    if (
      lowerQuery.includes("cooking") &&
      lowerQuery.includes("island") &&
      lowerQuery.includes("76")
    ) {
      if (lowerQuery.includes("xl")) {
        recommendations.push(products["COOKING-ISLAND-COVER-XL-76"]);
        return recommendations;
      } else if (lowerQuery.includes("large")) {
        recommendations.push(products["COOKING-ISLAND-COVER-LARGE-76"]);
        return recommendations;
      }
    }

    // General cover request with size
    if (
      lowerQuery.includes("2xl") ||
      lowerQuery.includes("xxl") ||
      lowerQuery.includes("2x")
    ) {
      recommendations.push(products["EGG-COVER-2XL"]);
      return recommendations;
    } else if (
      lowerQuery.includes("xl") ||
      lowerQuery.includes("extra large")
    ) {
      recommendations.push(products["EGG-COVER-XL"]);
      return recommendations;
    } else if (lowerQuery.includes("large")) {
      recommendations.push(products["EGG-COVER-LARGE"]);
      return recommendations;
    } else if (lowerQuery.includes("medium")) {
      recommendations.push(products["EGG-COVER-MEDIUM"]);
      return recommendations;
    } else if (lowerQuery.includes("small")) {
      recommendations.push(products["EGG-COVER-SMALL"]);
      return recommendations;
    } else if (
      lowerQuery.includes("minimax") ||
      lowerQuery.includes("mini max") ||
      lowerQuery.includes("mini")
    ) {
      recommendations.push(products["EGG-COVER-MINI"]);
      return recommendations;
    }

    // Cover request with no size specified - default to all options or a message
    if (
      lowerQuery === "cover" ||
      lowerQuery === "i need a cover" ||
      lowerQuery === "can you give me a cover" ||
      lowerQuery.includes("need cover") ||
      lowerQuery.includes("want cover") ||
      (lowerQuery.includes("cover") &&
        (lowerQuery.includes("egg") ||
          lowerQuery.includes("bge") ||
          lowerQuery.includes("big green egg")))
    ) {
      // Depends on context - in this case, let's provide the 2XL cover as default from example
      recommendations.push(products["EGG-COVER-2XL"]);
      return recommendations;
    }
  }

  // Check for cover requests specifically
  if (
    lowerQuery.includes("cover") &&
    (lowerQuery.includes("egg") ||
      lowerQuery.includes("bge") ||
      lowerQuery.includes("big green egg") ||
      lowerQuery === "cover" ||
      lowerQuery === "i need a cover" ||
      lowerQuery === "can you give me a cover")
  ) {
    // Try to determine size
    let mappedSize = "";
    if (
      lowerQuery.includes("minimax") ||
      lowerQuery.includes("mini max") ||
      lowerQuery.includes("mini-max")
    ) {
      mappedSize = "MINI";
    } else if (lowerQuery.includes("mini")) {
      mappedSize = "MINI";
    } else if (lowerQuery.includes("small")) {
      mappedSize = "SMALL";
    } else if (lowerQuery.includes("medium")) {
      mappedSize = "MEDIUM";
    } else if (lowerQuery.includes("large")) {
      mappedSize = "LARGE";
    } else if (
      lowerQuery.includes("xl") ||
      lowerQuery.includes("extra large")
    ) {
      mappedSize = "XL";
    } else if (
      lowerQuery.includes("2xl") ||
      lowerQuery.includes("xxl") ||
      lowerQuery.includes("2x")
    ) {
      mappedSize = "2XL";
    } else {
      // Default to 2XL if they previously mentioned it
      mappedSize = "2XL";
    }

    // Try to determine configuration
    if (lowerQuery.includes("table") || lowerQuery.includes("acacia")) {
      if (mappedSize === "LARGE") {
        recommendations.push(products["TABLE-COVER-LARGE"]);
      } else {
        // Use standalone cover for other sizes
        recommendations.push(products[`EGG-COVER-${mappedSize}`]);
      }
    } else if (lowerQuery.includes("nest") || lowerQuery.includes("stand")) {
      recommendations.push(products[`NEST-COVER-${mappedSize}`]);
    } else {
      // Default to standalone cover
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }

    // If we found recommendations, return them
    if (recommendations.length > 0) {
      return recommendations;
    }
  }

  // Check for specific product categories
  if (lowerQuery.includes("pizza")) {
    recommendations.push(
      products["PIZZA-STONE"],
      products["PIZZA-OVEN-WEDGE"],
      products["PIZZA-PEEL"]
    );
  } else if (
    lowerQuery.includes("smoke") ||
    lowerQuery.includes("smoking") ||
    lowerQuery.includes("brisket")
  ) {
    recommendations.push(
      products["WHISKEY-CHIPS"],
      products["BRISKET-KNIFE"],
      products["EGG-GENIUS"]
    );
  } else if (
    lowerQuery.includes("temperature") ||
    lowerQuery.includes("control")
  ) {
    recommendations.push(products["EGG-GENIUS"]);
  } else if (lowerQuery.includes("table") || lowerQuery.includes("stand")) {
    if (lowerQuery.includes("large")) {
      recommendations.push(
        products["ACACIA-TABLE-LARGE"],
        products["TABLE-COVER-LARGE"]
      );
    } else {
      // Add other tables based on size if needed
      recommendations.push(products["ACACIA-TABLE-LARGE"]);
    }
  } else if (lowerQuery.includes("grill") || lowerQuery.includes("grid")) {
    if (lowerQuery.includes("large")) {
      recommendations.push(products["GRID-LARGE"], products["HALF-GRID-LARGE"]);
    } else {
      recommendations.push(products["GRID-LARGE"]);
    }
  } else if (
    lowerQuery.includes("multiple") ||
    lowerQuery.includes("levels") ||
    lowerQuery.includes("eggspander")
  ) {
    if (lowerQuery.includes("xl")) {
      recommendations.push(products["EGGSPANDER-XL"]);
    } else if (lowerQuery.includes("large")) {
      recommendations.push(products["EGGSPANDER-LARGE"]);
    } else {
      recommendations.push(
        products["EGGSPANDER-LARGE"],
        products["EGGSPANDER-XL"]
      );
    }
  }

  return recommendations;
}

// Function to get product bundles
export function getProductBundles(query: string): ProductBundle[] {
  const lowerQuery = query.toLowerCase();
  const bundles: ProductBundle[] = [];

  if (lowerQuery.includes("pizza")) {
    bundles.push(productBundles["PIZZA-BUNDLE"]);
  } else if (
    lowerQuery.includes("smoke") ||
    lowerQuery.includes("smoking") ||
    lowerQuery.includes("brisket")
  ) {
    bundles.push(productBundles["SMOKING-BUNDLE"]);
  } else if (
    lowerQuery.includes("starter") ||
    lowerQuery.includes("beginner") ||
    lowerQuery.includes("new")
  ) {
    if (lowerQuery.includes("large")) {
      bundles.push(productBundles["LARGE-EGG-STARTER"]);
    } else {
      bundles.push(productBundles["LARGE-EGG-STARTER"]);
    }
  }

  return bundles;
}

// Function to recommend complementary products
export function getComplementaryProducts(productId: string): Product[] {
  const product = products[productId];
  if (!product || !product.relatedProducts) {
    return [];
  }

  return product.relatedProducts.map((id) => products[id]).filter(Boolean);
}

// Function to recommend an EGG size based on the user's needs
export function recommendEggSize(message: string): string {
  const lowerMessage = message.toLowerCase();
  console.log("DEBUG: recommendEggSize called with:", lowerMessage);

  // First, check for specific egg sizes mentioned
  if (
    lowerMessage.includes("2xl") ||
    lowerMessage.includes("2-xl") ||
    lowerMessage.includes("xxl") ||
    lowerMessage.includes("commercial") ||
    lowerMessage.includes("restaurant") ||
    lowerMessage.includes("catering")
  ) {
    return "2XL";
  }

  if (
    lowerMessage.includes("xl") ||
    lowerMessage.includes("x-large") ||
    lowerMessage.includes("extra large")
  ) {
    return "XL";
  }

  if (lowerMessage.includes("large") && !lowerMessage.includes("x")) {
    return "Large";
  }

  if (lowerMessage.includes("medium") || lowerMessage.includes("med")) {
    return "Medium";
  }

  if (lowerMessage.includes("small") && !lowerMessage.includes("minimax")) {
    return "Small";
  }

  if (
    lowerMessage.includes("minimax") ||
    lowerMessage.includes("mini max") ||
    lowerMessage.includes("mini-max")
  ) {
    return "MiniMax";
  }

  if (
    lowerMessage.includes("mini") &&
    !lowerMessage.includes("minimax") &&
    !lowerMessage.includes("mini max")
  ) {
    return "Mini";
  }

  // Special case for 2 people + camping/portable needs
  if (
    (lowerMessage.includes("2 people") ||
      lowerMessage.includes("two people") ||
      lowerMessage.includes("couple") ||
      lowerMessage.includes("just two") ||
      lowerMessage.includes("just 2") ||
      lowerMessage.match(/cook(ing)?\s+for\s+(2|two)/i)) &&
    (lowerMessage.includes("camping") ||
      lowerMessage.includes("camp") ||
      lowerMessage.includes("portable") ||
      lowerMessage.includes("travel") ||
      lowerMessage.includes("mobility") ||
      lowerMessage.includes("take with") ||
      lowerMessage.includes("outdoors"))
  ) {
    console.log(
      "DEBUG: Detected cooking for 2 people with camping/portability needs"
    );
    return "MiniMax";
  }

  // Check for number of people directly mentioned
  const capacityMatches = lowerMessage.match(
    /(\d+)\s*(?:people|persons|guests|family members|crowd|group)/i
  );
  if (capacityMatches && capacityMatches[1]) {
    const peopleCount = parseInt(capacityMatches[1], 10);
    console.log(`DEBUG: Detected cooking for ${peopleCount} people`);

    if (peopleCount >= 15) {
      return "2XL";
    } else if (peopleCount >= 8) {
      return "XL";
    } else if (peopleCount >= 4) {
      return "Large";
    } else if (peopleCount >= 2) {
      // Check if they also mentioned camping/portability for 2 people
      if (
        lowerMessage.includes("camping") ||
        lowerMessage.includes("camp") ||
        lowerMessage.includes("portable") ||
        lowerMessage.includes("travel") ||
        lowerMessage.includes("mobility") ||
        lowerMessage.includes("take with") ||
        lowerMessage.includes("outdoors")
      ) {
        return "MiniMax";
      }
      return "Medium";
    } else {
      return "Small";
    }
  }

  // Infer based on household size and cooking needs
  if (
    lowerMessage.includes("commercial") ||
    lowerMessage.includes("restaurant") ||
    lowerMessage.includes("many guests") ||
    lowerMessage.includes("large group") ||
    lowerMessage.includes("large gathering") ||
    lowerMessage.includes("big group") ||
    lowerMessage.includes("catering") ||
    lowerMessage.includes("big gathering") ||
    lowerMessage.includes("party") ||
    lowerMessage.includes("event") ||
    lowerMessage.includes("lot of people") ||
    lowerMessage.includes("lots of people") ||
    lowerMessage.includes("many people")
  ) {
    return "2XL";
  }

  if (
    lowerMessage.includes("large family") ||
    lowerMessage.includes("big family") ||
    lowerMessage.includes("extended family") ||
    lowerMessage.includes("entertaining") ||
    lowerMessage.includes("many dishes") ||
    lowerMessage.includes("multiple dishes") ||
    lowerMessage.includes("several people")
  ) {
    return "XL";
  }

  if (
    lowerMessage.includes("family") ||
    lowerMessage.includes("4-6 people") ||
    lowerMessage.includes("average household") ||
    lowerMessage.includes("standard") ||
    lowerMessage.includes("normal") ||
    lowerMessage.includes("regular")
  ) {
    return "Large";
  }

  if (
    lowerMessage.includes("small family") ||
    lowerMessage.includes("couple") ||
    lowerMessage.includes("2-3 people") ||
    lowerMessage.includes("limited space") ||
    lowerMessage.includes("not much space")
  ) {
    return "Medium";
  }

  if (
    lowerMessage.includes("single") ||
    lowerMessage.includes("just me") ||
    lowerMessage.includes("individual") ||
    lowerMessage.includes("one person") ||
    lowerMessage.includes("only me") ||
    lowerMessage.includes("very limited space") ||
    lowerMessage.includes("tiny space") ||
    lowerMessage.includes("patio") ||
    lowerMessage.includes("balcony")
  ) {
    return "Small";
  }

  if (
    lowerMessage.includes("portable") ||
    lowerMessage.includes("camping") ||
    lowerMessage.includes("tailgating") ||
    lowerMessage.includes("travel") ||
    lowerMessage.includes("take with me") ||
    lowerMessage.includes("take it with") ||
    lowerMessage.includes("mobile")
  ) {
    return "MiniMax";
  }

  if (
    lowerMessage.includes("smallest") ||
    lowerMessage.includes("most portable") ||
    lowerMessage.includes("picnic") ||
    lowerMessage.includes("tabletop")
  ) {
    return "Mini";
  }

  // Default to Large as it's the most popular size if we can't determine anything else
  return "Large";
}

// Function to generate a product recommendation message
export function generateProductRecommendationMessage(
  products: Product[],
  query: string
): string {
  if (products.length === 0) {
    return "I don't have specific product recommendations based on your query. Would you like me to help you find the right Big Green Egg size for your needs, or suggest some popular accessories?";
  }

  let message = `Based on your interest in ${query}, I recommend the following products:\n\n`;

  products.forEach((product) => {
    message += `• **[${product.name}](${product.url})** - ${product.price}\n  ${product.description}\n\n`;
  });

  message +=
    "Would you like more information about any of these products or would you like to see other options?";

  return message;
}

// Function to generate a bundle recommendation message
export function generateBundleRecommendationMessage(
  bundles: ProductBundle[]
): string {
  if (bundles.length === 0) {
    return "";
  }

  let message =
    "I also recommend these product bundles that offer better value:\n\n";

  bundles.forEach((bundle) => {
    message += `• **${bundle.name}** - ${bundle.totalPrice} (${bundle.discount})\n  ${bundle.description}\n  Includes: `;

    const productNames = bundle.products.map((p) => p.name).join(", ");
    message += productNames + "\n\n";
  });

  return message;
}

// Function to generate an EGG size recommendation message
export function generateEggSizeRecommendationMessage(
  recommendation: EggSizeRecommendation | null
): string {
  if (!recommendation) {
    return (
      "To help you find the perfect Big Green Egg size, could you tell me:\n\n" +
      "• How many people do you typically cook for?\n" +
      "• How much outdoor space do you have?\n" +
      "• Do you need portability (for camping, tailgating, etc.)?\n\n" +
      "If you're looking for accessories instead, please let me know which size EGG you have, and I can recommend the perfect accessories for your needs."
    );
  }

  return (
    `Based on your needs, I recommend the **[${recommendation.size} Big Green Egg](${recommendation.url})** (${recommendation.price}).\n\n` +
    `This size is ideal for: ${recommendation.recommendedFor}.\n\n` +
    `${recommendation.description}\n\n` +
    `Would you like to see some accessories that work well with this size?`
  );
}

// Function to generate a guided product selection message
export function generateGuidedSelectionMessage(): string {
  return (
    "I'd be happy to help you find the perfect Big Green Egg products! To get started, could you tell me:\n\n" +
    "• What type of cooking are you most interested in? (Grilling, smoking, baking, pizza, etc.)\n\n" +
    "• How many people do you typically cook for?\n\n" +
    "This will help me recommend the best egg for your specific needs."
  );
}

// Function to check if a query is asking about product selection
export function isProductSelectionQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  return (
    lowerQuery.includes("which size") ||
    lowerQuery.includes("what size") ||
    lowerQuery.includes("best size") ||
    lowerQuery.includes("recommend") ||
    lowerQuery.includes("right egg for me") ||
    lowerQuery.includes("which egg") ||
    lowerQuery.includes("help me choose") ||
    lowerQuery.includes("help me pick") ||
    lowerQuery.includes("which one should i") ||
    lowerQuery.includes("difference between") ||
    (lowerQuery.includes("size") && lowerQuery.includes("family"))
  );
}

// Function to recommend a cover based on EGG size and configuration
export function recommendEggCover(
  eggSize: string,
  configuration: string
): Product[] {
  const recommendations: Product[] = [];
  const size = eggSize.toLowerCase();
  const config = configuration.toLowerCase();

  // Map user input to actual EGG sizes
  let mappedSize = "";
  if (
    size.includes("minimax") ||
    size.includes("mini max") ||
    size.includes("mini-max")
  ) {
    mappedSize = "MINI";
  } else if (size.includes("mini")) {
    mappedSize = "MINI";
  } else if (size.includes("small")) {
    mappedSize = "SMALL";
  } else if (size.includes("medium")) {
    mappedSize = "MEDIUM";
  } else if (size.includes("large")) {
    mappedSize = "LARGE";
  } else if (size.includes("xl") || size.includes("extra large")) {
    mappedSize = "XL";
  } else if (
    size.includes("2xl") ||
    size.includes("xxl") ||
    size.includes("2x")
  ) {
    mappedSize = "2XL";
  } else {
    // Default to Large if size is unclear
    mappedSize = "LARGE";
  }

  // Recommend cover based on configuration and size
  if (
    config.includes("acacia table") ||
    (config.includes("table") && config.includes("acacia"))
  ) {
    if (mappedSize === "LARGE") {
      recommendations.push(products["TABLE-COVER-LARGE"]);
    } else if (mappedSize === "XL") {
      recommendations.push(products["EXPANSION-COVER-XL"]);
    } else {
      // For other sizes, no specific acacia table cover
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (config.includes("modern table") || config.includes("modern 53")) {
    if (mappedSize === "LARGE") {
      recommendations.push(products["MODERN-TABLE-COVER-LARGE-53"]);
    } else if (mappedSize === "XL") {
      recommendations.push(products["MODERN-TABLE-COVER-XL-53"]);
    } else {
      // For other sizes, no specific covers
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (config.includes("modern 72")) {
    if (mappedSize === "LARGE") {
      recommendations.push(products["MODERN-TABLE-COVER-LARGE-72"]);
    } else if (mappedSize === "XL") {
      recommendations.push(products["MODERN-TABLE-COVER-XL-72"]);
    } else {
      // For other sizes, no specific covers
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (config.includes("cooking island 49")) {
    if (mappedSize === "LARGE" || mappedSize === "XL") {
      recommendations.push(products["COOKING-ISLAND-COVER-" + mappedSize]);
    } else {
      // For other sizes, no specific covers
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (config.includes("cooking island 76")) {
    if (mappedSize === "LARGE" || mappedSize === "XL") {
      recommendations.push(
        products["COOKING-ISLAND-COVER-" + mappedSize + "-76"]
      );
    } else {
      // For other sizes, no specific covers
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (config.includes("modular") && config.includes("expansion")) {
    if (
      mappedSize === "MEDIUM" ||
      mappedSize === "LARGE" ||
      mappedSize === "XL"
    ) {
      recommendations.push(products["EXPANSION-COVER-" + mappedSize]);
    } else {
      // For other sizes, no specific covers
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (config.includes("modular")) {
    if (mappedSize === "2XL" || mappedSize === "XL" || mappedSize === "LARGE") {
      recommendations.push(products["MODULAR-COVER-" + mappedSize]);
    } else if (mappedSize === "MEDIUM") {
      recommendations.push(products["NEST-COVER-MEDIUM"]);
    } else {
      // For other sizes, no specific covers
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  } else if (
    config.includes("nest") ||
    config.includes("stand") ||
    config.includes("handler")
  ) {
    recommendations.push(products[`NEST-COVER-${mappedSize}`]);
  } else if (config.includes("built-in") || config.includes("builtin")) {
    recommendations.push(products[`EGG-COVER-${mappedSize}`]);
  } else if (config.includes("dome") || config.includes("top")) {
    recommendations.push(products[`EGG-COVER-${mappedSize}`]);
  } else {
    // Default standalone EGG
    if (mappedSize === "MINI" || mappedSize === "MINIMAX") {
      recommendations.push(products["EGG-COVER-MINI"]);
    } else {
      recommendations.push(products[`EGG-COVER-${mappedSize}`]);
    }
  }

  return recommendations;
}

// Function to check if a query is asking about EGG covers
export function isEggCoverQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Check for direct cover queries
  const hasCoverTerm =
    lowerQuery.includes("cover") ||
    lowerQuery.includes("covering") ||
    lowerQuery.includes("protection") ||
    lowerQuery.includes("protect");

  // Check for EGG related terms
  const hasEggTerm =
    lowerQuery.includes("egg") ||
    lowerQuery.includes("bge") ||
    lowerQuery.includes("big green egg") ||
    lowerQuery.includes("grill");

  // Check for standalone cover requests
  const isStandaloneCoverRequest =
    lowerQuery === "cover" ||
    lowerQuery === "i need a cover" ||
    lowerQuery === "can you give me a cover" ||
    lowerQuery.startsWith("cover for");

  return (hasCoverTerm && hasEggTerm) || isStandaloneCoverRequest;
}

// Function to generate an EGG cover recommendation message
export function generateEggCoverRecommendationMessage(
  products: Product[],
  eggSize: string,
  configuration: string
): string {
  if (products.length === 0) {
    return "I don't have specific cover recommendations for that configuration. Could you provide more details about your Big Green Egg size and setup (table, nest, or standalone)?";
  }

  let message = `Based on your ${eggSize} EGG in a ${configuration} configuration, I recommend the following cover:\n\n`;

  products.forEach((product) => {
    message += `• **[${product.name}](${product.url})** - ${product.price}\n  ${product.description}\n\n`;
  });

  message +=
    "This cover is specially designed to protect your EGG from weather elements like rain, sun, and dust. Would you like information about any other accessories for your Big Green Egg?";

  return message;
}

// Add this new function after the containsEggSize function
export function parseEggSize(message: string): string {
  // Default to Large if no size is specified
  let eggSize = "Large";

  const lowerMessage = message.toLowerCase();

  // Special case for camping scenarios with small number of people
  if (
    (lowerMessage.includes("camping") ||
      lowerMessage.includes("camp") ||
      lowerMessage.includes("portable") ||
      lowerMessage.includes("travel") ||
      lowerMessage.includes("mobility") ||
      lowerMessage.includes("take with") ||
      lowerMessage.includes("outdoors")) &&
    (lowerMessage.includes("2 people") ||
      lowerMessage.includes("two people") ||
      lowerMessage.includes("couple") ||
      lowerMessage.includes("just two") ||
      lowerMessage.includes("just 2") ||
      lowerMessage.match(/cook(ing)?\s+for\s+(2|two)/i))
  ) {
    console.log(
      "DEBUG: Parsing message with camping + small number of people, suggesting MiniMax"
    );
    return "MiniMax";
  }

  // Check for specific sizes in order of specificity
  if (
    lowerMessage.includes("2xl") ||
    lowerMessage.includes("xxl") ||
    lowerMessage.includes("2x") ||
    lowerMessage.includes("2-xl") ||
    lowerMessage.includes("2 xl") ||
    lowerMessage.includes("2x large") ||
    (lowerMessage.includes("2") && lowerMessage.includes("extra large"))
  ) {
    eggSize = "2XL";
  } else if (
    lowerMessage.includes("xl") ||
    lowerMessage.includes("x-large") ||
    lowerMessage.includes("extra large") ||
    lowerMessage.includes("x large") ||
    lowerMessage.includes("xtra large")
  ) {
    eggSize = "XL";
  } else if (
    lowerMessage.includes("large") &&
    !lowerMessage.includes("xl") &&
    !lowerMessage.includes("extra")
  ) {
    eggSize = "Large";
  } else if (lowerMessage.includes("medium") || lowerMessage.includes("med")) {
    eggSize = "Medium";
  } else if (
    lowerMessage.includes("small") &&
    !lowerMessage.includes("minimax") &&
    !lowerMessage.includes("mini max")
  ) {
    eggSize = "Small";
  } else if (
    lowerMessage.includes("minimax") ||
    lowerMessage.includes("mini max") ||
    lowerMessage.includes("mini-max")
  ) {
    eggSize = "MiniMax";
  } else if (
    lowerMessage.includes("mini") &&
    !lowerMessage.includes("minimax") &&
    !lowerMessage.includes("mini max")
  ) {
    eggSize = "Mini";
  } else if (
    // Check for portable/camping needs without explicit size
    (lowerMessage.includes("camping") ||
      lowerMessage.includes("camp") ||
      lowerMessage.includes("portable") ||
      lowerMessage.includes("travel") ||
      lowerMessage.includes("take with me") ||
      lowerMessage.includes("take it with") ||
      lowerMessage.includes("mobile")) &&
    lowerMessage.includes("small") // If they mention "small" with camping
  ) {
    eggSize = "MiniMax";
  }

  return eggSize;
}
