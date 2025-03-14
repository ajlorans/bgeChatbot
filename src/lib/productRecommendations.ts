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
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"],
    relatedProducts: ["WHISKEY-CHIPS", "HICKORY-CHIPS"],
  },
  "HICKORY-CHIPS": {
    name: "Hickory Smoking Chips",
    description:
      "Classic smoking chips that add rich, savory flavor to foods. Perfect for pork, chicken, beef and cheese.",
    price: "$14.99",
    url: "https://biggreenegg.com/collections/charcoal-wood-starters/products/hickory-smoking-chips-2-9-l-180-cu-in",
    category: "smoking",
    compatibleWith: ["2XL", "XL", "Large", "Medium", "Small", "MiniMax", "Mini"],
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

// Function to recommend EGG size based on household size and cooking needs
export function recommendEggSize(query: string): EggSizeRecommendation | null {
  const lowerQuery = query.toLowerCase();

  // Check for specific numbers first
  if (
    lowerQuery.match(/\b(1[2-9]|[2-9]\d+)\b/) || // Matches 12 or more
    lowerQuery.includes("twelve") ||
    lowerQuery.includes("thirteen") ||
    lowerQuery.includes("fourteen") ||
    lowerQuery.includes("fifteen") ||
    lowerQuery.includes("sixteen") ||
    lowerQuery.includes("seventeen") ||
    lowerQuery.includes("eighteen") ||
    lowerQuery.includes("nineteen") ||
    lowerQuery.includes("twenty") ||
    lowerQuery.includes("many people") ||
    lowerQuery.includes("lots of people") ||
    lowerQuery.includes("large group") ||
    lowerQuery.includes("big group")
  ) {
    return eggSizeRecommendations["COMMERCIAL"];
  }

  // Check for 6-11 people
  if (
    lowerQuery.match(/\b([6-9]|1[0-1])\b/) || // Matches 6-11
    lowerQuery.includes("six") ||
    lowerQuery.includes("seven") ||
    lowerQuery.includes("eight") ||
    lowerQuery.includes("nine") ||
    lowerQuery.includes("ten") ||
    lowerQuery.includes("eleven") ||
    lowerQuery.includes("6 people") ||
    lowerQuery.includes("7 people") ||
    lowerQuery.includes("8 people") ||
    lowerQuery.includes("9 people") ||
    lowerQuery.includes("10 people") ||
    lowerQuery.includes("11 people") ||
    lowerQuery.includes("for 6") ||
    lowerQuery.includes("for 7") ||
    lowerQuery.includes("for 8") ||
    lowerQuery.includes("for 9") ||
    lowerQuery.includes("for 10") ||
    lowerQuery.includes("for 11") ||
    lowerQuery.includes("for six") ||
    lowerQuery.includes("for seven") ||
    lowerQuery.includes("for eight") ||
    lowerQuery.includes("for nine") ||
    lowerQuery.includes("for ten") ||
    lowerQuery.includes("for eleven")
  ) {
    return eggSizeRecommendations["LARGE-FAMILY"];
  }

  if (
    lowerQuery.includes("single") ||
    lowerQuery.includes("just me") ||
    lowerQuery.includes("portable") ||
    lowerQuery.includes("camping") ||
    lowerQuery.includes("tailgating") ||
    lowerQuery.includes("balcony") ||
    lowerQuery.includes("small space")
  ) {
    return eggSizeRecommendations["SINGLE-PERSON"];
  } else if (
    lowerQuery.includes("small family") ||
    lowerQuery.includes("couple") ||
    lowerQuery.includes("2-3 people") ||
    lowerQuery.includes("2 to 3 people")
  ) {
    return eggSizeRecommendations["SMALL-FAMILY"];
  } else if (
    lowerQuery.includes("family") ||
    lowerQuery.includes("3-5 people") ||
    lowerQuery.includes("3 to 5 people") ||
    lowerQuery.includes("average")
  ) {
    return eggSizeRecommendations["AVERAGE-FAMILY"];
  } else if (
    lowerQuery.includes("large family") ||
    lowerQuery.includes("entertain") ||
    lowerQuery.includes("5-8 people") ||
    lowerQuery.includes("5 to 8 people") ||
    lowerQuery.includes("big family")
  ) {
    return eggSizeRecommendations["LARGE-FAMILY"];
  } else if (
    lowerQuery.includes("commercial") ||
    lowerQuery.includes("restaurant") ||
    lowerQuery.includes("very large") ||
    lowerQuery.includes("huge") ||
    lowerQuery.includes("catering")
  ) {
    return eggSizeRecommendations["COMMERCIAL"];
  }

  return null;
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
    "• Do you already own a Big Green Egg? If so, which size?\n\n" +
    "• What type of cooking are you most interested in? (Grilling, smoking, baking, pizza, etc.)\n\n" +
    "• How many people do you typically cook for?\n\n" +
    "This will help me recommend the best products for your specific needs."
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
