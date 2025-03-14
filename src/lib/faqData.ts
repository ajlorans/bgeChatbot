// FAQ data for ceramic cookers based on information from The Naked Whiz
// Source: https://www.nakedwhiz.com/ceramicfaq.htm

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  source?: string;
}

// Categories from The Naked Whiz
export const faqCategories = [
  "General Information",
  "Buying Ceramic Cookers",
  "Using Ceramic Cookers",
  "Accessories",
  "Problems and Troubleshooting",
  "Smoking and Barbecuing",
  "Safety",
  "Temperature Control"
];

export const faqData: FAQ[] = [
  // General Information
  {
    id: "ceramic-origin",
    question: "Where did ceramic cookers come from?",
    answer: "Kamado-style ceramic cookers have ancient origins, but the modern utility patent for a kamado-style barbecue cooker is held by Farhad Sazegar. While many people associate these cookers with specific brands like Big Green Egg, the concept has a much longer history. The word 'kamado' itself is thousands of years old and comes from Japanese, where it refers to a traditional cooking stove or hearth.",
    category: "General Information",
    keywords: ["origin", "history", "kamado", "invention", "patent"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "kamado-pronunciation",
    question: "How do you pronounce the word 'Kamado'?",
    answer: "Since 'kamado' is a Japanese word, it should be pronounced accordingly. The correct pronunciation is 'kah-mah-doh' with equal emphasis on all syllables. Many people incorrectly pronounce it with different emphasis patterns.",
    category: "General Information",
    keywords: ["pronounce", "pronunciation", "kamado", "say", "japanese"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-construction",
    question: "How are ceramic cookers constructed?",
    answer: "Ceramic cookers are made of various materials, and the term 'ceramic' is used quite loosely in the industry. Materials include 'space age' ceramics, terra cotta, refractory materials, and portland cement mixed with lava rock. The walls are heavy and thick, with thickness varying by manufacturer. Most can withstand cooking temperatures up to 1000 degrees Fahrenheit. This construction allows for excellent heat retention and insulation, enabling you to sear at high temperatures, smoke at low temperatures, and cook at everything in between.",
    category: "General Information",
    keywords: ["construction", "materials", "built", "made", "ceramic", "walls", "thickness"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  
  // Using Ceramic Cookers
  {
    id: "temperature-control",
    question: "How do you control temperature on kamado-style ceramic cookers?",
    answer: "Temperature is controlled by adjusting the airflow through the cooker. Kamado-style cookers have adjustable vents at both the bottom and top of the cooker. By precisely controlling these vents, you can maintain temperature within a few degrees of your target. The bottom vent controls how much oxygen enters the cooker, while the top vent controls how much air exits. More air flow means higher temperatures, while restricting air flow lowers the temperature.",
    category: "Temperature Control",
    keywords: ["temperature", "control", "vents", "airflow", "adjust", "heat"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "searing-temperatures",
    question: "How hot can you sear meats on a kamado-style cooker?",
    answer: "You can achieve very high searing temperatures on ceramic cookers, often exceeding 700°F and sometimes reaching over 1000°F. This is possible because you're using lump charcoal (which burns hotter than briquettes) and because the ceramic cooker creates a chimney effect when closed, with vents at the bottom and top. This draft fans the fire and gets it much hotter than charcoal in a typical open grill.",
    category: "Using Ceramic Cookers",
    keywords: ["sear", "temperature", "hot", "high heat", "steak"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "temperature-range",
    question: "What range of temperatures can you use to cook on a ceramic cooker?",
    answer: "The temperature range on ceramic cookers is truly impressive. You can cold smoke cheese at temperatures as low as 85°F, sear steaks at over 1200°F, and cook at every temperature in between. This versatility allows you to smoke, grill, bake, roast, and sear all on the same cooker, simply by controlling the airflow through the vents.",
    category: "Temperature Control",
    keywords: ["temperature", "range", "low", "high", "versatility"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "rain-usage",
    question: "Can I use ceramic cookers in the rain?",
    answer: "Yes, ceramic cookers work great in the rain. Cold rain pouring down on hot ceramic will not damage your cooker. In heavy downpours, you might want to fashion some protection over the top vent to prevent water from entering the cooker, but rain shouldn't stop you from using a ceramic cooker. Some users use umbrellas, stove pipe caps, or other methods to keep rain out of the top vent.",
    category: "Using Ceramic Cookers",
    keywords: ["rain", "weather", "water", "outdoor", "wet"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "cold-weather-usage",
    question: "Can I use ceramic cookers in cold weather?",
    answer: "Most definitely. While metal cooker owners might need to rig up insulation and wind blocks in cold weather, ceramic cookers perform well in the coldest conditions. The ceramic insulates the fire from the cold and allows you to cook without special adaptations. Charcoal consumption will be greater in cold weather, but you'll still be able to cook for long periods on a single load of charcoal.",
    category: "Using Ceramic Cookers",
    keywords: ["cold", "winter", "snow", "freezing", "weather"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "cold-weather-storage",
    question: "Can I leave ceramic cookers outside in cold weather?",
    answer: "Yes, cold temperatures will not harm your ceramic cooker. It's a good idea to keep it covered with a weather-resistant cover, but there's no need to bring it indoors during winter. The ceramic material is designed to withstand temperature extremes.",
    category: "Using Ceramic Cookers",
    keywords: ["cold", "winter", "storage", "outside", "cover"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "wooden-deck-usage",
    question: "Can I use ceramic cookers on a wooden deck?",
    answer: "Yes, you can use a ceramic cooker on a wooden deck, but you need to take appropriate precautions. Don't use the cooker with just the ceramic feet that come with it, as embers might come out of the lower vent. The bottom of ceramic cookers can get quite hot under some conditions, so you should add a layer of protection between the cooker and your wooden deck. Options include a metal stand with wheels (like the Big Green Egg nest), a ceramic or stone tile, or specially designed heat shields.",
    category: "Safety",
    keywords: ["deck", "wood", "wooden", "surface", "protection", "fire", "safety"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  
  // Safety Questions
  {
    id: "flashback",
    question: "What is flashback or backdraft?",
    answer: "Flashback (or more correctly, backdraft) is a critical safety issue with ceramic cookers. It occurs when oxygen rapidly enters a hot, oxygen-depleted environment, causing an abrupt burning of superheated gases. This happens when you open the lid of your cooker when it has a hot fire but restricted airflow. The volatile organic compounds (VOCs) from the charcoal can't burn due to lack of oxygen, but when you open the lid, the rush of oxygen can cause what seems like an explosion of flame. To prevent backdraft, avoid closing vents when you have a hot fire. If you need to open the lid with a hot fire, first open your top vent followed by your bottom vent to let oxygen in and allow gases to burn off safely before opening the lid.",
    category: "Safety",
    keywords: ["flashback", "backdraft", "explosion", "flame", "safety", "danger", "open lid"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "heat-protection",
    question: "What should I place beneath my cooker to protect wood beneath it from heat?",
    answer: "To protect wooden surfaces from the heat of your ceramic cooker, you should use appropriate heat-resistant materials. Options include concrete pavers, firebrick, vermiculite bricks, sheets of calcium silicate, ceramic tile, or bluestone/slate. The Big Green Egg Table Nest is another option designed specifically for this purpose. The goal is to create sufficient insulation between the hot cooker and the flammable wooden surface to prevent heat damage or fire hazards.",
    category: "Safety",
    keywords: ["protection", "heat", "wood", "table", "surface", "fire", "safety"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "gasket-safety",
    question: "Are gaskets like the Rutland, Cotronics, or Nomex gaskets safe?",
    answer: "Based on extensive research, there is no reason to suspect that Rutland, Cotronics, and Nomex gaskets are unsafe for use on ceramic charcoal cookers. However, you should always read any information available about the specific material you plan to use and make an informed decision regarding its safety. These gaskets are designed to withstand high temperatures and create a better seal between the lid and base of your cooker.",
    category: "Safety",
    keywords: ["gasket", "rutland", "cotronics", "nomex", "safety", "seal"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "galvanized-metal-safety",
    question: "Is galvanized metal safe to use in a charcoal cooker?",
    answer: "Yes, it is safe to use galvanized metal in charcoal cookers. Despite some concerns about zinc fumes, research indicates that the temperatures typically reached in ceramic cookers are not high enough to cause significant zinc vaporization from galvanized metal. The galvanized coating actually helps protect the metal from corrosion in the high-heat, potentially moist environment of a cooker.",
    category: "Safety",
    keywords: ["galvanized", "metal", "zinc", "safety", "fumes"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "jb-weld-safety",
    question: "Is JB Weld safe to use in a charcoal cooker?",
    answer: "JB Weld is safe to use for making repairs to components of your ceramic cooker. This two-part epoxy/hardener combination is inert once cured, according to the manufacturer. While freshly cured JB Weld may emit an odor when heated above 400°F, this odor disappears after a few hours of heating. The manufacturer only advises against direct contact with food. JB Weld can be effectively used to repair ceramic fireboxes and other components of your cooker.",
    category: "Safety",
    keywords: ["jb weld", "repair", "epoxy", "safety", "fix"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  
  // Handling and Moving
  {
    id: "moving-cooker",
    question: "What's the best way to move a ceramic cooker in a nest or cart?",
    answer: "Never push a ceramic cooker in a nest or cart. If the wheels hit an obstacle and stop suddenly, you might push the whole thing over, resulting in a broken cooker. Always pull the cooker and nest/cart toward you when moving them. It's best to grab the nest itself rather than the cooker's handle or hinge. Getting a grip lower down makes it less likely that you'll pull the whole thing over.",
    category: "Using Ceramic Cookers",
    keywords: ["move", "moving", "nest", "cart", "wheels", "transport"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "lifting-cooker",
    question: "How should I lift my cooker out of a nest or table?",
    answer: "Do not lift your cooker by the hinge in the back, any brackets for side tables, or the handle. Essentially, avoid lifting by anything attached to the bands that hold your base and lid, as the base or lid may slip out of the band and fall. Instead, use a pot lifter, or for larger cookers, take the lid out of the band and then reach down into the cooker and grab it by the lower vent. Helpers can grab the rim of the base to assist.",
    category: "Using Ceramic Cookers",
    keywords: ["lift", "lifting", "move", "handle", "hinge", "table", "nest"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "wind-safety",
    question: "Can the wind blow my cooker over?",
    answer: "Generally, no. Ceramic cookers are heavy enough to withstand strong winds. However, cookers in carts/nests with wheels have been blown off patios or slabs when the wheels weren't locked. Always lock your wheels if you have them, as damage from tipping is typically not covered by warranties.",
    category: "Safety",
    keywords: ["wind", "blow", "tip", "over", "wheels", "lock"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  
  // Big Green Egg Specific FAQs
  {
    id: "bge-sizes",
    question: "What sizes does the Big Green Egg come in?",
    answer: "The Big Green Egg comes in seven different sizes to accommodate various cooking needs:\n\n• 2XL: The largest size, perfect for very large gatherings and commercial use. Can cook up to 20 steaks at once.\n\n• XL: Great for larger families and entertaining. Can cook two 20-pound turkeys at once.\n\n• Large: The most popular size, perfect for most families. Versatile for everything from appetizers to entrees.\n\n• Medium: Perfect for smaller families or limited spaces while still providing plenty of cooking area.\n\n• Small: Great for individuals, couples, or small spaces like balconies and small patios.\n\n• MiniMax: Portable yet powerful. Perfect for tailgating, camping, or small patios.\n\n• Mini: The most portable option. Perfect for camping, picnics, or table-top cooking.",
    category: "General Information",
    keywords: ["size", "sizes", "big green egg", "bge", "dimensions", "which size", "options"],
    source: "https://biggreenegg.com/collections/all-eggs-egg-packages"
  },
  {
    id: "bge-warranty",
    question: "What is the warranty on a Big Green Egg?",
    answer: "The Big Green Egg offers a limited lifetime warranty for materials and workmanship on all ceramic components (including the dome, base, damper top, fire box and fire ring) to the original purchaser or owner who has registered their warranty. The metal components (including the metal bands, hinge mechanism and metal top) carry a limited five-year warranty. The temperature gauge and gaskets carry a limited one-year warranty. This warranty is based on normal and reasonable residential use of the Big Green Egg.",
    category: "General Information",
    keywords: ["warranty", "guarantee", "lifetime", "coverage", "broken", "crack", "replacement"],
    source: "https://biggreenegg.com"
  },
  {
    id: "bge-first-use",
    question: "How do I prepare my Big Green Egg for first use?",
    answer: "To prepare your Big Green Egg for first use:\n\n1. Make sure all components are properly placed (fire box, fire ring, cooking grid).\n\n2. Fill the fire box with natural lump charcoal up to just below the fire ring.\n\n3. Light the charcoal using either an electric starter, natural fire starters, or a chimney starter (never use lighter fluid).\n\n4. Leave the dome open for 10 minutes with the bottom vent fully open.\n\n5. Close the dome and adjust the top and bottom vents to reach your desired temperature.\n\n6. For the very first use, it's recommended to heat the EGG to about 350°F and maintain that temperature for about an hour to properly season it before cooking food.",
    category: "Using Ceramic Cookers",
    keywords: ["first use", "setup", "new egg", "season", "prepare", "first time", "start"],
    source: "https://biggreenegg.com"
  },
  {
    id: "bge-charcoal",
    question: "What type of charcoal should I use in my Big Green Egg?",
    answer: "Big Green Egg recommends using natural lump charcoal rather than briquettes. Natural lump charcoal is made from hardwood that has been burned in the absence of oxygen, leaving pure carbon. It lights quickly, burns hotter, produces less ash, and imparts a cleaner flavor to your food compared to briquettes. Big Green Egg produces their own premium natural lump charcoal, but any high-quality natural lump charcoal will work well. Avoid using briquettes as they contain additives and binders that can affect the flavor of your food and produce more ash that can clog the air vents.",
    category: "Using Ceramic Cookers",
    keywords: ["charcoal", "fuel", "lump", "briquettes", "best charcoal", "lighting", "burn"],
    source: "https://biggreenegg.com"
  },
  {
    id: "bge-cleaning",
    question: "How do I clean my Big Green Egg?",
    answer: "Cleaning your Big Green Egg is relatively simple:\n\n1. For regular cleaning, heat the EGG to 500-600°F with the vents open to burn off food residue (self-cleaning mode).\n\n2. Use the ash tool to stir the remaining charcoal and allow ash to fall through to the bottom.\n\n3. When the EGG is completely cool, remove the internal components and clean out the ash from the bottom vent.\n\n4. The cooking grid can be cleaned with a grill brush while still warm.\n\n5. For deeper cleaning, the internal ceramic components can be flipped over when they become heavily soiled (the heat will burn off the residue on the underside).\n\n6. The exterior ceramic surface can be cleaned with a damp cloth and mild detergent if needed.\n\n7. Never use chemical cleaners or water inside your EGG when it's hot, as this could cause cracking.",
    category: "Using Ceramic Cookers",
    keywords: ["clean", "cleaning", "maintenance", "ash", "remove", "wash", "care"],
    source: "https://biggreenegg.com"
  },
  {
    id: "bge-smoking-wood",
    question: "What wood chips or chunks are best for smoking in a Big Green Egg?",
    answer: "The best wood for smoking in your Big Green Egg depends on what you're cooking:\n\n• Mild woods (Apple, Cherry, Peach): Great for poultry, pork, and seafood. Impart a subtle, sweet flavor.\n\n• Medium woods (Hickory, Maple, Oak): Versatile options that work well with most meats, especially pork and beef.\n\n• Strong woods (Mesquite, Walnut): Best for red meats and game, as they impart a robust flavor.\n\n• Specialty woods (Whiskey Barrel, Wine Barrel): Offer unique flavor profiles for special occasions.\n\nWhen smoking on a Big Green Egg, you can use either chips or chunks. Chunks burn longer and are better for extended cooks, while chips burn faster and are good for shorter cooks. There's no need to soak the wood before using it in a Big Green Egg, as the controlled airflow environment allows for efficient smoking without pre-soaking.",
    category: "Smoking and Barbecuing",
    keywords: ["wood", "chips", "chunks", "smoking", "flavor", "hickory", "mesquite", "apple", "cherry"],
    source: "https://biggreenegg.com"
  },
  {
    id: "bge-accessories",
    question: "What are the essential accessories for a Big Green Egg?",
    answer: "Essential accessories for your Big Green Egg include:\n\n1. **ConvEGGtor** (Plate Setter): Allows for indirect cooking, smoking, and baking.\n\n2. **EGGspander System**: Provides multiple cooking levels and configurations.\n\n3. **Cast Iron Cooking Grid**: Excellent for searing and creating grill marks.\n\n4. **Pizza & Baking Stone**: Perfect for pizzas, breads, and other baked goods.\n\n5. **Ash Tool**: Helps with cleaning and maintaining proper airflow.\n\n6. **Grill Gripper**: Safely removes hot cooking grids.\n\n7. **Temperature Controller** (like the EGG Genius): Monitors and maintains cooking temperature.\n\n8. **Instant Read Thermometer**: Ensures food is cooked to the proper temperature.\n\n9. **All-Natural Charcoal**: Provides clean-burning fuel for your EGG.\n\n10. **Weather-Resistant Cover**: Protects your investment from the elements.\n\nThe accessories you need may vary depending on your cooking style and the types of food you prepare most often.",
    category: "Accessories",
    keywords: ["accessories", "conveggtor", "plate setter", "eggspander", "tools", "must have", "essential"],
    source: "https://biggreenegg.com/collections"
  },
  {
    id: "bge-conveggtor",
    question: "What is a ConvEGGtor and how do I use it?",
    answer: "The ConvEGGtor (formerly called the Plate Setter) is one of the most versatile accessories for the Big Green Egg. It's a ceramic heat shield that creates indirect heat by preventing food from being exposed to direct flame.\n\nTo use the ConvEGGtor:\n\n1. Light your charcoal and bring your EGG up to the desired temperature.\n\n2. Carefully place the ConvEGGtor inside the EGG, legs down, sitting on the fire ring.\n\n3. Place the cooking grid on top of the fire ring, above the ConvEGGtor.\n\n4. For added versatility, you can place a drip pan on top of the ConvEGGtor to catch drippings.\n\nThe ConvEGGtor transforms your EGG into a convection oven, perfect for:\n• Low and slow smoking\n• Roasting meats\n• Baking pizzas, breads, and desserts\n• Cooking delicate foods that might burn over direct heat\n\nIt's an essential accessory for anyone wanting to explore the full versatility of their Big Green Egg beyond direct grilling.",
    category: "Accessories",
    keywords: ["conveggtor", "plate setter", "indirect", "smoking", "baking", "pizza", "shield"],
    source: "https://biggreenegg.com/collections/ceramics-grids"
  },
  {
    id: "bge-cracked-firebox",
    question: "My Big Green Egg firebox is cracked. Is this normal and what should I do?",
    answer: "Cracks in the firebox of a Big Green Egg are normal and expected over time. The firebox is designed to crack as part of its normal operation due to the thermal expansion and contraction that occurs during heating and cooling cycles. These cracks do not affect the performance of your EGG and are considered normal wear.\n\nThe firebox is designed with sections that allow it to expand and contract without compromising its functionality. As long as the pieces remain in place and aren't falling apart, there's no need for replacement.\n\nIf your firebox has deteriorated to the point where pieces are falling out or it's no longer stable, you can purchase a replacement firebox. If your EGG is still under warranty and the firebox has deteriorated beyond normal wear, contact your dealer about a warranty replacement.",
    category: "Problems and Troubleshooting",
    keywords: ["crack", "cracked", "firebox", "broken", "fire box", "replace", "warranty"],
    source: "https://biggreenegg.com"
  },
  {
    id: "bge-temperature-fluctuation",
    question: "Why does the temperature in my Big Green Egg fluctuate?",
    answer: "Temperature fluctuations in your Big Green Egg can occur for several reasons:\n\n1. **Weather conditions**: Wind can cause temperature changes by affecting airflow through the vents.\n\n2. **Vent adjustments**: Making large adjustments to the vents can cause temperature swings. Make small, incremental adjustments and wait for the temperature to stabilize.\n\n3. **Charcoal quality**: Different brands or batches of lump charcoal can burn at different rates and temperatures.\n\n4. **Dome thermometer accuracy**: The dome thermometer may not always reflect the exact temperature at the cooking grid level.\n\n5. **Opening the dome**: Every time you open the dome, you lose heat and introduce oxygen, which can cause temperature spikes.\n\n6. **Ash buildup**: Excessive ash can restrict airflow and affect temperature control.\n\nTo maintain stable temperatures:\n• Make small vent adjustments\n• Minimize opening the dome\n• Use consistent, high-quality charcoal\n• Clean out ash regularly\n• Consider using a digital temperature controller like the EGG Genius\n• Use multiple temperature probes to monitor both dome and grid-level temperatures",
    category: "Temperature Control",
    keywords: ["temperature", "fluctuation", "control", "stable", "changes", "swing", "adjust"],
    source: "https://biggreenegg.com"
  },
  // Additional FAQs from The Naked Whiz (https://www.nakedwhiz.com/ceramicfaq.htm)
  {
    id: "temperature-range-detail",
    question: "What is the full temperature range I can achieve with my ceramic cooker?",
    answer: "The range of temperatures you can use on a ceramic charcoal cooker is truly amazing. You can cold smoke cheese at temperatures as low as 85°F, sear steaks at over 1200°F, and cook at every temperature in between. This incredible versatility allows you to smoke, grill, bake, roast, and sear all on the same cooker by simply controlling the airflow through the vents.",
    category: "Temperature Control",
    keywords: ["temperature", "range", "low", "high", "cold smoking", "searing", "versatility"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-construction-materials",
    question: "What materials are ceramic cookers made from?",
    answer: "Ceramic cookers are made of various materials, and the term 'ceramic' is used quite loosely in the industry. Materials include 'space age' ceramics, terra cotta, refractory materials, and portland cement mixed with lava rock. The walls are heavy and thick, with thickness varying by manufacturer. Most can withstand cooking temperatures up to 1000°F. This construction provides excellent heat retention and insulation, enabling versatile cooking at a wide range of temperatures.",
    category: "General Information",
    keywords: ["materials", "construction", "ceramic", "walls", "thickness", "build quality"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "cooking-time-single-load",
    question: "How long can I cook on a single load of charcoal?",
    answer: "With a ceramic cooker loaded with hardwood lump charcoal to about halfway up the fire ring, you can cook at low temperatures for 30-40 hours. Yes, hours! Many users have cooked pork butts for 20 hours and still had at least half the original charcoal remaining in the cooker. You'll never need to add more charcoal during a cook as long as you start with enough.",
    category: "Using Ceramic Cookers",
    keywords: ["charcoal", "duration", "cook time", "fuel efficiency", "long cooks"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "outside-surface-temperature",
    question: "How hot does the outside of a ceramic cooker get?",
    answer: "Despite some claims that ceramic cookers remain 'cool to the touch' on the outside, this is not accurate. The exterior of ceramic cookers does get hot, especially after prolonged cooking at high temperatures. While the ceramic provides good insulation, the outer surface will still reach temperatures that can cause burns if touched. Always exercise caution and assume the exterior is hot when cooking.",
    category: "Safety",
    keywords: ["temperature", "exterior", "outside", "surface", "hot", "safety"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "rain-cooking",
    question: "Can I use my ceramic cooker in the rain?",
    answer: "Yes, ceramic cookers work great in the rain. Cold rain pouring down on hot ceramic will not damage your cooker. In heavy downpours, you might want to fashion some protection over the top vent to prevent water from entering the cooker, but rain shouldn't stop you from using a ceramic cooker. Some users employ umbrellas, stove pipe caps, or other methods to keep rain out of the top vent while still allowing proper airflow.",
    category: "Using Ceramic Cookers",
    keywords: ["rain", "weather", "water", "outdoor", "wet"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "wood-burning",
    question: "Can I burn wood in a ceramic cooker?",
    answer: "It's not recommended to simply burn wood in ceramic cookers. Doing so can lead to creosote deposits on the inside of the cooker. Also, it's very difficult to regulate temperature because the wood might ignite and burn with a flame, causing temperature spikes. If you reduce airflow, the flames may go out, and the wood will smolder, producing excessive smoke. If you want to use wood, it's better to burn it down to coals in another container first, then add those coals to the cooker as needed.",
    category: "Using Ceramic Cookers",
    keywords: ["wood", "burning", "fuel", "alternative", "creosote", "temperature control"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "covering-cooker",
    question: "Should I cover my ceramic cooker when not in use?",
    answer: "Yes, it's generally a good idea to cover your ceramic cooker when not in use. While most ceramic cookers have fired exteriors, some do not. Tiled cookers would benefit from a cover to prevent moisture from penetrating the grout. All ceramic cookers have a hole in the top for a thermometer, and water can enter via this hole, contributing to moisture levels inside when not in use and potentially leading to mold. A good cover provides protection against the elements and helps maintain your cooker in optimal condition.",
    category: "Using Ceramic Cookers",
    keywords: ["cover", "protection", "storage", "maintenance", "weather", "moisture"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "clean-burn",
    question: "Should I do a clean burn in my ceramic cooker?",
    answer: "The practice of doing a 'clean burn' (taking your cooker to 600°F or more for an hour or two to burn off residue) is somewhat controversial. While it can help clean the interior, frequent high-temperature burns can potentially stress the ceramic components over time. If you do choose to perform clean burns, do so sparingly and avoid extreme temperature cycling (heating very high and then cooling rapidly). Many experienced users find that normal cooking cycles help maintain the cooker naturally without dedicated clean burns.",
    category: "Using Ceramic Cookers",
    keywords: ["clean", "burn", "maintenance", "high temperature", "residue"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "repairing-ceramic",
    question: "Can I repair a broken ceramic cooker?",
    answer: "Yes, you can make minor repairs to broken ceramic cookers using a product called JB Weld, which is a two-part epoxy system. For ceramic fireboxes that have cracked (which is normal with use), JB Weld can be used to glue the pieces back together. Some users have also reported success using furnace cement for repairs. For most minor cracks in the firebox, however, no repair is necessary as they don't affect the cooker's performance.",
    category: "Problems and Troubleshooting",
    keywords: ["repair", "broken", "crack", "JB Weld", "firebox", "fix"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "lighter-fluid-smell",
    question: "How can I get rid of lighter fluid smell from a ceramic cooker?",
    answer: "If you've used lighter fluid in your ceramic cooker or bought a used cooker that smells of lighter fluid, you can eliminate the smell by heating your cooker to about 500°F (260°C) for about an hour. Let the cooker cool and then repeat this process several times if needed. The high heat will burn off the lighter fluid residue and eliminate the smell.",
    category: "Problems and Troubleshooting",
    keywords: ["lighter fluid", "smell", "odor", "clean", "remove", "high heat"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "crazing-glaze",
    question: "There are small cracks in the glaze of my ceramic cooker. Is this normal?",
    answer: "Yes, these small cracks in the glaze (known as crazing) are completely normal and do not affect the performance or durability of your ceramic cooker. This is a common characteristic of the ceramic glaze used on many cookers. You may not notice it at first, but it tends to become more visible if ash gets into these tiny cracks. This crazing doesn't get worse over time and doesn't compromise the structural integrity of your cooker.",
    category: "Problems and Troubleshooting",
    keywords: ["crazing", "cracks", "glaze", "finish", "surface", "normal"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "lid-wont-stay-open",
    question: "The lid on my ceramic cooker won't stay open. What should I do?",
    answer: "If your lid won't stay open, there are a few potential solutions. First, check that you've installed the hinge correctly according to the manufacturer's instructions - it's possible to install some hinges upside down. Some cookers like Kamado Joe have adjustable springs in their hinges, so consult your owner's manual for adjustment instructions. If you have an older model, contact the manufacturer about possible replacement parts or adjustments.",
    category: "Problems and Troubleshooting",
    keywords: ["lid", "open", "stay", "hinge", "spring", "adjustment"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "firebox-cracks",
    question: "My firebox has cracks. Is this normal?",
    answer: "Yes, cracks in the firebox are completely normal and expected with ceramic cookers. The firebox is subjected to thermal expansion and contraction during heating and cooling cycles, which naturally causes cracks to form over time. These cracks don't affect the performance of your cooker. The firebox is actually designed with sections that allow it to expand and contract without compromising functionality. As long as the pieces remain in place and aren't falling apart, there's no need for replacement.",
    category: "Problems and Troubleshooting",
    keywords: ["firebox", "cracks", "normal", "broken", "ceramic", "wear"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "silicone-sealant",
    question: "What type of silicone sealant should I use to repair my ceramic cooker?",
    answer: "The type of silicone sealant to use depends on how hot you let your cooker get. For normal cooking under 400-450°F, any silicone that can handle 400°F or more will work well. The ceramic around the lower vent typically won't exceed 200-225°F during normal cooking. However, if you do high-temperature cooking such as pizza or perform 'clean burns,' choose a high-temperature silicone sealant rated for at least 500°F, preferably one that can handle up to 700°F, as temperatures around the lower vent can reach 350-465°F during very high-temperature cooks.",
    category: "Problems and Troubleshooting",
    keywords: ["silicone", "sealant", "repair", "vent", "temperature", "high-heat"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "flashback-prevention",
    question: "What is flashback or backdraft and how do I prevent it?",
    answer: "Flashback (more correctly called backdraft) is a serious safety issue with ceramic cookers. It occurs when oxygen rapidly enters a hot, oxygen-depleted environment, causing volatile gases to ignite suddenly. This happens when you open the lid when the cooker has a hot fire but restricted airflow. To prevent backdraft: (1) Avoid fully closing vents with a hot fire inside, (2) If you need to open the lid with a hot fire, first open the top vent fully, then the bottom vent, wait 10-20 seconds to allow gases to burn off safely, then open the lid slowly. Always stand to the side, not directly in front of the cooker when opening the lid.",
    category: "Safety",
    keywords: ["flashback", "backdraft", "explosion", "flame", "safety", "danger", "open lid"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "kamado-origin",
    question: "What is the origin of the word 'kamado'?",
    answer: "The word 'kamado' is an ancient Japanese term that has been used for thousands of years. It refers to a traditional cooking stove or hearth in Japanese culture. The modern ceramic cookers using this name are inspired by these traditional Japanese cooking devices, although they've been significantly adapted for modern barbecue use. Despite some claims, the word 'kamado' wasn't invented in the 1960s by any particular company or importer of clay cookers - it's an authentic Japanese word with centuries of history.",
    category: "General Information",
    keywords: ["kamado", "origin", "japanese", "word", "meaning", "history"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "kamado-pronunciation",
    question: "How do you pronounce the word 'kamado'?",
    answer: "Since 'kamado' is a Japanese word, the correct pronunciation is 'kah-mah-doh' with equal emphasis on all syllables. Many people incorrectly pronounce it with different emphasis patterns, but following the Japanese pronunciation is most accurate.",
    category: "General Information",
    keywords: ["kamado", "pronounce", "pronunciation", "say", "japanese"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "different-briquettes",
    question: "Can I use different types of charcoal briquettes in my ceramic cooker?",
    answer: "While natural lump charcoal is generally recommended for ceramic cookers, you can use high-quality briquettes if you prefer. However, avoid using instant-light briquettes (those pre-soaked in lighter fluid) as they can impart chemical flavors to your food. Regular briquettes will work, but they produce more ash than lump charcoal, which may require more frequent cleaning of your cooker's vents to maintain proper airflow. Briquettes also typically don't burn as hot as lump charcoal, which may limit your maximum cooking temperature.",
    category: "Using Ceramic Cookers",
    keywords: ["briquettes", "charcoal", "fuel", "lighter fluid", "match light", "ash"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "pulled-pork-cooking",
    question: "How do I cook pulled pork in a ceramic cooker?",
    answer: "To cook perfect pulled pork in a ceramic cooker: (1) Start with a pork shoulder/boston butt (7-10 lbs) and apply your preferred rub the night before. (2) Set up your cooker for indirect cooking at 225-250°F using the plate setter/ConvEGGtor. (3) Add a few chunks of smoking wood (hickory, apple, or cherry work well). (4) Place the pork fat-side up on the grill grate. (5) Cook until the internal temperature reaches 195-205°F (typically 1.5 hours per pound, so 12-16 hours for an 8 lb butt). (6) Remove, wrap in foil, and rest for at least 1 hour before pulling. (7) Pull the pork by hand or with forks, removing any large pieces of fat. (8) Mix in a small amount of your favorite BBQ sauce or finishing sauce if desired.",
    category: "Smoking and Barbecuing",
    keywords: ["pulled pork", "pork butt", "shoulder", "barbecue", "low and slow", "smoking"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "pizza-cooking",
    question: "How can I cook pizza on a ceramic cooker?",
    answer: "To cook pizza on a ceramic cooker: (1) Use a pizza stone and preheat it thoroughly - set up for indirect heat with the ConvEGGtor/plate setter, then place the stone on the cooking grid. (2) Heat the cooker to 500-650°F for thin crust or 400-450°F for thick crust. (3) Allow at least 30-45 minutes for the stone to fully heat. (4) Use cornmeal or flour on a pizza peel to help slide the pizza onto the hot stone. (5) Cook thin crust pizzas for about 5-7 minutes at the higher temperature or thick crust for 12-15 minutes at the lower temperature. (6) For best results, keep the dome closed as much as possible to maintain temperature. A pizza turning peel can help rotate the pizza without removing it completely.",
    category: "Using Ceramic Cookers",
    keywords: ["pizza", "stone", "baking", "high temperature", "crust", "indirect"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "cold-smoking",
    question: "Can I cold smoke in a ceramic cooker?",
    answer: "Yes, you can cold smoke in a ceramic cooker, although it requires some technique to maintain the very low temperatures needed (usually below 90°F for cheese or 120°F for other items). Methods include: (1) Using a small amount of lit charcoal with smoking wood chunks on top, managing airflow carefully. (2) Using an external smoke generator that feeds smoke into the cooker while keeping the heat source separate. (3) Using the 'maze' method with pellets in a tray that burn slowly without generating much heat. (4) In hot weather, you might need to add ice in a pan inside the cooker to help keep temperatures down. Cold smoking works best in cool ambient temperatures, making fall, winter, or early spring ideal times for cold smoking in most climates.",
    category: "Smoking and Barbecuing",
    keywords: ["cold smoke", "cheese", "salmon", "low temperature", "smoke generator", "smoking"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  // More FAQs from The Naked Whiz (https://www.nakedwhiz.com/ceramicfaq.htm)
  {
    id: "brisket-cooking",
    question: "How do I cook brisket in a ceramic cooker?",
    answer: "To cook brisket in a ceramic cooker: (1) Start with a whole packer brisket (12-15 lbs) or just the flat (6-8 lbs). (2) Trim excess fat, leaving about 1/4 inch fat cap. (3) Apply your favorite rub the night before or just before cooking. (4) Set up for indirect cooking at 225-250°F using the ConvEGGtor/plate setter. (5) Add wood chunks for smoke (oak, hickory, or pecan work well). (6) Place the brisket fat side down initially. (7) After 4-5 hours or when the internal temperature reaches about 165°F, consider wrapping in butcher paper or foil. (8) Continue cooking until the internal temperature reaches 200-205°F and a probe slides in with little resistance (typically 1-1.5 hours per pound total). (9) Rest wrapped in a cooler for at least 1-2 hours before slicing. (10) Slice against the grain for maximum tenderness.",
    category: "Smoking and Barbecuing",
    keywords: ["brisket", "beef", "smoking", "barbecue", "texas", "low and slow"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "moving-cooker",
    question: "What's the best way to move a ceramic cooker in a nest or cart?",
    answer: "Never push a ceramic cooker in a nest or cart. If the wheels hit an obstacle and stop suddenly, you might push the whole thing over, resulting in a broken cooker. Always pull the cooker and nest/cart toward you when moving them. It's best to grab the nest itself rather than the cooker's handle or hinge. Getting a grip lower down makes it less likely that you'll pull the whole thing over.",
    category: "Using Ceramic Cookers",
    keywords: ["move", "moving", "nest", "cart", "wheels", "transport"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "lifting-cooker",
    question: "How should I lift my cooker out of a nest or table?",
    answer: "Do not lift your ceramic cooker by the hinge in the back, any brackets for side tables, or the handle. Essentially, avoid lifting by anything attached to the bands that hold your base and lid, as the base or lid may slip out of the band and fall. Instead, for smaller cookers, use a pot lifter. For larger cookers, take the lid out of the band and then reach down into the cooker and grab it by the lower vent. Helpers can grab the rim of the base to assist. Always lift with your legs, not your back, as ceramic cookers are heavy.",
    category: "Using Ceramic Cookers",
    keywords: ["lift", "lifting", "move", "handle", "hinge", "table", "nest"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "wind-safety",
    question: "Can the wind blow my cooker over?",
    answer: "Generally, no. Ceramic cookers are heavy enough to withstand strong winds. However, cookers in carts/nests with wheels have been blown off patios or slabs when the wheels weren't locked. Always lock your wheels if you have them, as damage from tipping is typically not covered by warranties. In extremely high winds, you may want to position your cooker in a sheltered location for additional safety.",
    category: "Safety",
    keywords: ["wind", "blow", "tip", "over", "wheels", "lock"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "heat-protection-surfaces",
    question: "What should I place beneath my cooker to protect wood beneath it from heat?",
    answer: "To protect wooden surfaces from the heat of your ceramic cooker, you should use appropriate heat-resistant materials. Good options include: (1) Concrete pavers - inexpensive and effective, (2) Firebrick - excellent insulation properties, (3) Vermiculite bricks - lightweight and good insulation, (4) Sheets of calcium silicate - professional-grade insulation, (5) Ceramic tile - decorative and functional, (6) Bluestone or slate - natural stone options, or (7) Purpose-built products like the Big Green Egg Table Nest. The goal is to create sufficient insulation between the hot cooker and the flammable wooden surface to prevent heat damage or fire hazards.",
    category: "Safety",
    keywords: ["protection", "heat", "wood", "table", "surface", "fire", "safety"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "gasket-safety",
    question: "Are gaskets like the Rutland, Cotronics, or Nomex gaskets safe?",
    answer: "Based on extensive research, there is no reason to suspect that Rutland, Cotronics, and Nomex gaskets are unsafe for use on ceramic charcoal cookers. These gaskets are designed to withstand high temperatures and create a better seal between the lid and base of your cooker. Rutland gasket is made from fiberglass, Cotronics is a ceramic material, and Nomex is a high-temperature resistant synthetic fiber developed by DuPont. Always read any information available about the specific material you plan to use and make an informed decision regarding its safety.",
    category: "Safety",
    keywords: ["gasket", "rutland", "cotronics", "nomex", "safety", "seal"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "galvanized-metal-safety",
    question: "Is galvanized metal safe to use in a charcoal cooker?",
    answer: "Yes, it is generally safe to use galvanized metal in charcoal cookers. Despite some concerns about zinc fumes, research indicates that the temperatures typically reached in ceramic cookers are not high enough to cause significant zinc vaporization from galvanized metal. Zinc begins to vaporize at approximately 787°F (419°C), and while ceramic cookers can reach these temperatures, most cooking is done at lower temperatures. The galvanized coating actually helps protect the metal from corrosion in the high-heat, potentially moist environment of a cooker. If you're concerned, you can pre-heat any galvanized components before their first use with food.",
    category: "Safety",
    keywords: ["galvanized", "metal", "zinc", "safety", "fumes", "toxicity"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "jb-weld-safety",
    question: "Is JB Weld safe to use in a charcoal cooker?",
    answer: "JB Weld is safe to use for making repairs to components of your ceramic cooker. This two-part epoxy/hardener combination is inert once cured, according to the manufacturer. While freshly cured JB Weld may emit an odor when heated above 400°F, this odor disappears after a few hours of heating. The manufacturer only advises against direct contact with food. JB Weld can be effectively used to repair ceramic fireboxes, cracked domes, and other components of your cooker. After applying JB Weld for repairs, it's a good practice to do a burn without food to ensure any initial curing odors dissipate before cooking food.",
    category: "Safety",
    keywords: ["jb weld", "repair", "epoxy", "safety", "fix", "glue"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "smoking-woods-guide",
    question: "What are the best woods for smoking different types of food?",
    answer: "Different woods impart different flavors when used for smoking:\n\n• Mild woods (Apple, Cherry, Peach): Light, sweet, fruity flavors. Great for poultry, pork, fish, and delicate meats.\n\n• Medium woods (Hickory, Maple, Oak, Pecan): More robust flavors. Hickory is classic for pork; oak and pecan are versatile for beef, pork, and poultry.\n\n• Strong woods (Mesquite, Walnut): Bold, earthy flavors. Best for red meats and game; can overpower more delicate foods.\n\n• Specialty woods (Whiskey/Wine Barrel): Unique flavors with hints of the spirits they once held.\n\nAvoid using softwoods like pine, spruce, or cedar (except for planking) as they contain resins that produce unpleasant flavors and potential toxins when burned.",
    category: "Smoking and Barbecuing",
    keywords: ["wood", "smoking", "flavor", "hickory", "mesquite", "apple", "cherry", "oak"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-seal",
    question: "How tight should the seal be between the dome and base of my ceramic cooker?",
    answer: "The seal between the dome and base should be snug but not airtight. A perfect seal isn't necessary for proper function - in fact, some airflow around the gasket is normal. Your cooker's ability to hold temperature depends more on the overall insulation properties of the ceramic than on having a perfect seal. If you notice significant smoke leakage, uneven gaps when closed, or have difficulty maintaining low temperatures, you might consider replacing or upgrading your gasket. Popular aftermarket options include felt, nomex, and silicone gaskets, each with different temperature tolerance and longevity characteristics.",
    category: "Using Ceramic Cookers",
    keywords: ["seal", "gasket", "dome", "leak", "gap", "smoke", "temperature"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "soaking-wood-chunks",
    question: "Should I soak wood chunks or chips before using them for smoking?",
    answer: "There's a longstanding debate about soaking wood before smoking, but most experienced ceramic cooker users recommend against it. Here's why: (1) Soaked wood doesn't actually smoke until it dries out, it just steams, delaying the smoking process. (2) The controlled environment of a ceramic cooker allows for efficient burning of dry wood without it catching fire too quickly. (3) Dry wood produces cleaner smoke with better flavor compounds. (4) For longer smokes, use larger chunks rather than chips - they'll burn slower naturally without soaking. If you want to extend smoking time, consider placing wood chunks around the perimeter of your charcoal rather than directly on hot coals.",
    category: "Smoking and Barbecuing",
    keywords: ["soak", "wood", "chunks", "chips", "smoking", "steam", "moisture"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "temperature-swings",
    question: "Why does my ceramic cooker's temperature swing up and down?",
    answer: "Temperature swings in ceramic cookers are usually caused by one of these issues: (1) Overcorrection - making large vent adjustments instead of small, incremental changes. (2) Opening the lid frequently - this introduces oxygen that temporarily spikes the temperature. (3) Weather conditions - wind can increase airflow through the cooker. (4) Charcoal arrangement - having too many small pieces rather than a mix of sizes can cause uneven burning. (5) Learning curve - it takes practice to master temperature control. For more stable temperatures: make tiny vent adjustments, wait 15-20 minutes before making additional changes, minimize lid openings, use a mix of charcoal sizes, and consider using a temperature controller for critical cooks requiring precise temperatures.",
    category: "Temperature Control",
    keywords: ["temperature", "swings", "fluctuation", "control", "stability", "adjustment"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "seasoning-ceramic-cooker",
    question: "Do I need to season my ceramic cooker before first use?",
    answer: "Unlike cast iron cookware, ceramic cookers don't require traditional 'seasoning' with oil. However, it is recommended to do an initial break-in procedure: (1) Install all components properly according to the manufacturer's instructions. (2) Fill the firebox with natural lump charcoal. (3) Light the charcoal and establish a fire with the lid open. (4) Close the lid and adjust the vents to reach approximately 350°F. (5) Maintain this temperature for about 60 minutes. This process helps burn off any manufacturing residues and begins building a thin layer of carbon on the interior that will improve the cooker's performance over time. After this initial break-in, you're ready to cook.",
    category: "Using Ceramic Cookers",
    keywords: ["season", "seasoning", "first use", "break in", "new cooker", "initial", "setup"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "thermometer-calibration",
    question: "How do I calibrate the dome thermometer on my ceramic cooker?",
    answer: "To calibrate your dome thermometer: (1) Remove it from the dome (usually by loosening a nut on the inside of the dome). (2) Bring a pot of water to a full boil. (3) Immerse the stem of the thermometer in the boiling water, making sure not to touch the bottom of the pot. (4) At sea level, the thermometer should read 212°F (100°C). At higher elevations, the boiling point will be lower (about 3.5°F less per 1,000 feet above sea level). (5) If the reading is off, many dome thermometers have a small nut on the back that can be turned to adjust the dial. (6) For non-adjustable thermometers, note the difference and account for it in your cooking. Remember that dome thermometers measure the air temperature at the top of the dome, which can differ from the actual cooking surface temperature.",
    category: "Temperature Control",
    keywords: ["thermometer", "calibrate", "adjustment", "temperature", "accuracy", "dome"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "cooker-longevity",
    question: "How long will a ceramic cooker last?",
    answer: "With proper care, ceramic cookers can last decades. Many users report having their cookers for 15-20+ years with no significant degradation in performance. The ceramic components are highly durable and designed to withstand thousands of cooking cycles. The most common parts that may need replacement over time are the gasket (every 1-3 years depending on use), metal bands and hinges (5-10 years), and possibly the firebox (which naturally develops cracks but remains functional). The exterior glaze helps protect the ceramic from weathering. To maximize longevity: (1) Use a cover when not in use, (2) Don't expose the cooker to extreme temperature changes, (3) Handle with care when moving, and (4) Perform regular basic maintenance.",
    category: "General Information",
    keywords: ["longevity", "lifespan", "durability", "how long", "last", "years", "lifetime"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ash-removal",
    question: "How often should I remove ash from my ceramic cooker?",
    answer: "How often you should remove ash depends on how frequently you use your cooker, but generally: (1) For occasional users (1-2 times per week) - check and remove ash every 3-4 cooks. (2) For frequent users (3+ times per week) - check and remove ash weekly. (3) After high-temperature cooks - these burn more charcoal and produce more ash. (4) When the ash starts to impede airflow through the bottom vent. To remove ash: wait until the cooker is completely cool, carefully remove the internal components, and scoop out the ash. A specialized ash tool can help stir the ash so it falls through the grate before removal. Always leave a thin layer of ash at the bottom to protect the ceramic and provide insulation.",
    category: "Using Ceramic Cookers",
    keywords: ["ash", "cleanup", "removal", "maintenance", "clean", "airflow"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-versus-others",
    question: "What are the advantages of ceramic cookers over traditional grills?",
    answer: "Ceramic cookers offer several advantages over traditional grills:\n\n1. Temperature Range: Can maintain temperatures from 200°F to 700°F+ for everything from low-and-slow smoking to high-heat searing.\n\n2. Fuel Efficiency: Use 25-50% less charcoal than metal grills and can cook for 12+ hours on a single load.\n\n3. Temperature Stability: Excellent insulation maintains consistent cooking temperatures regardless of outside weather.\n\n4. Versatility: Functions as a grill, smoker, oven, and pizza oven all in one.\n\n5. Moisture Retention: Ceramic helps maintain food moisture for juicier results.\n\n6. Weather Resistance: Works well in cold, heat, rain, and wind.\n\n7. Longevity: With proper care, can last decades rather than the 3-5 years typical of many metal grills.",
    category: "General Information",
    keywords: ["advantages", "benefits", "comparison", "versus", "better", "traditional", "grill"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "reverse-sear-method",
    question: "What is the reverse sear method for steaks on a ceramic cooker?",
    answer: "The reverse sear method produces exceptional steaks on ceramic cookers:\n\n1. Set up for indirect cooking at 225-250°F using the ConvEGGtor/plate setter.\n\n2. Place thick steaks (1.5\"+ thick) on the grill and cook until they reach about 115°F for rare, 125°F for medium-rare (about 15-20°F below your target final temperature).\n\n3. Remove steaks and set aside while you reconfigure for direct cooking by removing the ConvEGGtor and opening vents to raise temperature to 500-600°F+.\n\n4. Return steaks to the grill and sear each side for 1-2 minutes until you achieve a beautiful crust.\n\n5. Rest steaks for 5-10 minutes before serving.\n\nThis method provides edge-to-edge consistent doneness with a perfect sear, avoiding the overcooked band you get with traditional methods.",
    category: "Using Ceramic Cookers",
    keywords: ["reverse sear", "steak", "beef", "method", "technique", "searing", "temperature"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "moisture-in-cooker",
    question: "How do I deal with moisture and mold in my ceramic cooker?",
    answer: "To prevent and address moisture and mold in your ceramic cooker:\n\n1. Prevention: After cooking, leave vents open for 10-15 minutes to let moisture escape before closing and cooling. Use a weatherproof cover when not in use.\n\n2. Minor mold: For light mold growth, simply do a normal cook. The heat will kill the mold and burn it away. A 350°F cook for 30 minutes will eliminate most mold.\n\n3. Significant mold: For heavier mold, do a clean burn at 500-600°F for about an hour to eliminate all mold and spores.\n\n4. Between uses: Consider leaving one vent slightly open under your cover to allow airflow. In very humid climates, some users place a container of unscented kitty litter or charcoal in the cooker to absorb moisture.\n\nRemember that mold presence is not harmful to the cooker itself and can be completely eliminated with heat.",
    category: "Problems and Troubleshooting",
    keywords: ["moisture", "mold", "damp", "humid", "wet", "prevention", "clean"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  // Final batch of FAQs from The Naked Whiz
  {
    id: "smoking-ribs",
    question: "How do I smoke ribs on a ceramic cooker?",
    answer: "To smoke perfect ribs on a ceramic cooker:\n\n1. Preparation: Remove the membrane from the bone side of the ribs and apply your favorite rub.\n\n2. Setup: Configure for indirect cooking at 225-250°F using the ConvEGGtor/plate setter. Add wood chunks for smoke (hickory, apple, or cherry work well).\n\n3. Cooking Methods:\n   • 3-2-1 Method (for St. Louis/spare ribs): Smoke uncovered for 3 hours, wrap in foil with liquid for 2 hours, then unwrap and cook for 1 final hour with sauce applied in the last 30 minutes.\n   • 2-1-1 Method (for baby back ribs): Similar to 3-2-1 but with shorter times due to the leaner meat.\n   • No-wrap Method: Smoke continuously at 225-250°F for 4-6 hours, spritzing occasionally with apple juice or similar liquid.\n\n4. Doneness: Ribs are done when the meat pulls back from the bone ends by about 1/4 inch and a toothpick slides easily between the bones.\n\n5. Rest for 10-15 minutes before slicing between the bones to serve.",
    category: "Smoking and Barbecuing",
    keywords: ["ribs", "pork", "smoke", "barbecue", "3-2-1", "baby back", "spare ribs"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "cooking-turkey",
    question: "What's the best way to cook a turkey on a ceramic cooker?",
    answer: "To cook a turkey on a ceramic cooker:\n\n1. Preparation: Brine the turkey for 12-24 hours for extra moisture and flavor (optional but recommended). Dry thoroughly and apply butter or oil under and over the skin with your preferred seasonings.\n\n2. Setup: Configure for indirect cooking at 325-350°F using the ConvEGGtor/plate setter. Use a drip pan under the turkey to catch drippings.\n\n3. Cooking Methods:\n   • Traditional Roast: Place turkey on a v-rack in a drip pan and cook until breast meat reaches 160°F and thigh meat reaches 170°F (about 12-15 minutes per pound).\n   • Spatchcock Method: Remove the backbone and flatten the turkey for quicker, more even cooking (approximately 8-10 minutes per pound).\n\n4. Use of a ceramic poultry roaster that holds liquid in the cavity can add moisture and flavor.\n\n5. Rest the turkey for at least 30 minutes before carving to allow juices to redistribute.\n\nThe ceramic cooker's moisture-retaining properties make it ideal for producing juicy, flavorful turkey with crispy skin.",
    category: "Using Ceramic Cookers",
    keywords: ["turkey", "roast", "thanksgiving", "holiday", "spatchcock", "poultry"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "lump-vs-briquettes",
    question: "What's the difference between lump charcoal and briquettes for ceramic cookers?",
    answer: "Lump charcoal and briquettes differ in several important ways for ceramic cooker use:\n\n1. Composition:\n   • Lump charcoal is pure carbonized wood with no additives.\n   • Briquettes contain wood char plus binders, fillers, and sometimes chemical additives.\n\n2. Performance:\n   • Lump burns hotter (up to 1200°F vs. 800°F for briquettes).\n   • Lump lights faster and responds more quickly to airflow changes.\n   • Briquettes burn more consistently and for a longer time.\n   • Lump produces less ash, important for longer cooks in ceramic cookers.\n\n3. Flavor:\n   • Lump imparts a cleaner, more natural wood flavor.\n   • Some briquettes can add chemical tastes, especially cheaper brands.\n\n4. Recommendation for ceramic cookers: High-quality lump charcoal is generally preferred for its higher heat potential, lower ash production, and cleaner flavor profile, though some users mix in briquettes for longer low-temperature cooks.",
    category: "Using Ceramic Cookers",
    keywords: ["lump", "briquettes", "charcoal", "fuel", "comparison", "difference", "burn"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-smoking-chips",
    question: "How do I use wood chips or chunks for smoking in a ceramic cooker?",
    answer: "To use wood for smoking in a ceramic cooker:\n\n1. Wood Selection:\n   • Chunks (2-4 inches): Best for longer cooks as they smolder slowly.\n   • Chips: Burn faster, better for shorter cooks or when you want initial smoke burst.\n   • Avoid using wood from conifers (pine, spruce, etc.) which contain resins that produce unpleasant flavors.\n\n2. Preparation:\n   • Dry wood is preferable - soaking is unnecessary in ceramic cookers and can produce dirty smoke.\n   • For chip containment, consider a metal smoking box or aluminum foil pouch with holes poked in it.\n\n3. Placement:\n   • For Low & Slow: Place 2-3 chunks around the perimeter of your charcoal before lighting.\n   • For Hot & Fast: Place chunks or chips directly on lit coals for immediate smoke.\n\n4. Amount Guideline:\n   • Short cooks (< 2 hours): 1-2 chunks or a handful of chips\n   • Medium cooks (2-6 hours): 3-4 chunks\n   • Long cooks (> 6 hours): 4-6 chunks added in stages\n\n5. The goal is thin blue smoke, not thick white smoke which can create bitter flavors.",
    category: "Smoking and Barbecuing",
    keywords: ["wood", "chips", "chunks", "smoke", "flavor", "smoking", "placement"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "two-zone-cooking",
    question: "How do I set up two-zone cooking on a ceramic cooker?",
    answer: "Setting up two-zone cooking on a ceramic cooker:\n\n1. Half-Moon Method:\n   • Place a half-moon ceramic heat deflector (ConvEGGtor/plate setter) on one side of the cooker.\n   • This creates a hot direct zone over the exposed coals and a cooler indirect zone over the deflector.\n   • Great for foods that need searing and then gentle finishing.\n\n2. Raised Grid Method:\n   • Install the full ConvEGGtor/plate setter for indirect heat.\n   • Place a raised half-moon grid above one side of the cooking surface.\n   • This creates two zones with the raised side being hotter due to proximity to the dome heat.\n\n3. Multi-Level Setup (EGGspander or similar):\n   • Use multi-level cooking systems to create different heat zones at different heights.\n   • Lower grids closer to the heat source cook hotter and faster.\n\n4. Temperature Differential:\n   • In ceramic cookers, the temperature difference between zones is less dramatic than in metal grills due to excellent heat circulation.\n   • The indirect side typically runs 50-100°F cooler than the direct side.\n\nTwo-zone cooking is perfect for items like chicken (sear skin side, then finish indirectly) or reverse-searing steaks.",
    category: "Using Ceramic Cookers",
    keywords: ["two-zone", "dual zone", "direct", "indirect", "setup", "configuration"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "breaking-in-ceramic-cooker",
    question: "How do I break in a new ceramic cooker?",
    answer: "Breaking in a new ceramic cooker properly:\n\n1. Initial Assembly:\n   • Follow the manufacturer's instructions carefully when assembling.\n   • Ensure all bands, hinges, and hardware are properly tightened.\n   • Place internal components (firebox, fire ring, grates) in their correct positions.\n\n2. First Firing:\n   • Fill firebox with natural lump charcoal to just below the fire ring.\n   • Light using natural fire starters or an electric starter (never use lighter fluid).\n   • Open both top and bottom vents fully.\n   • Let fire establish with lid open for 10-15 minutes.\n\n3. Temperature Cycle:\n   • Close the lid and allow temperature to rise gradually to about 350°F (175°C).\n   • Maintain this temperature for approximately 60 minutes.\n   • This burns off manufacturing residues and begins seasoning the interior.\n\n4. Optional Higher Temp Seasoning:\n   • Some users prefer to then gradually increase temperature to 500-600°F for another 30 minutes.\n   • This further seasons the interior and helps set the gasket.\n\n5. Cool Down:\n   • Close vents and allow cooker to cool naturally.\n   • Never use water to cool a hot ceramic cooker as thermal shock could cause cracking.\n\nAfter this break-in, your ceramic cooker is ready for cooking.",
    category: "Using Ceramic Cookers",
    keywords: ["break in", "new", "first use", "season", "set up", "initial"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-winter",
    question: "What are some tips for using a ceramic cooker in cold winter weather?",
    answer: "Tips for using a ceramic cooker in cold winter weather:\n\n1. Fuel Considerations:\n   • Use more charcoal than usual as it will burn faster in cold weather.\n   • Start with a full firebox for longer cooks.\n   • Consider using larger chunks of lump charcoal for longer burn times.\n\n2. Startup Procedure:\n   • Allow more time for the cooker to come up to temperature (15-30 minutes longer than in warm weather).\n   • Let the ceramic thoroughly warm up before adjusting to your target temperature.\n   • Open vents wider initially to establish a good fire before dialing back.\n\n3. Temperature Management:\n   • Expect to use wider vent openings than in warm weather to maintain the same temperature.\n   • Make smaller vent adjustments than usual as the cooker will respond more slowly in cold.\n   • Wind has a greater effect in cold weather - consider using a windbreak if necessary.\n\n4. Practical Tips:\n   • Clear snow from around the cooker for safe access.\n   • Wear heat-resistant gloves when handling the cooker - metal parts get much colder.\n   • Keep the lid closed as much as possible to maintain temperature.\n   • Use remote thermometers to monitor food so you don't need to open the lid frequently.\n\nCeramic cookers perform remarkably well in cold weather compared to metal grills due to their excellent insulation properties.",
    category: "Using Ceramic Cookers",
    keywords: ["winter", "cold", "snow", "ice", "freezing", "weather", "temperature"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-lighting",
    question: "What's the best way to light charcoal in a ceramic cooker?",
    answer: "Best methods for lighting charcoal in a ceramic cooker:\n\n1. Electric Starter:\n   • Insert into the charcoal and turn on for 3-5 minutes until a small area of coals is glowing.\n   • Remove starter and allow fire to develop naturally.\n   • Advantages: No chemicals, reliable, and creates a consistent starting point.\n\n2. Natural Fire Starters:\n   • Place 1-2 paraffin or wood fiber starters in the charcoal pile.\n   • Light and allow to burn until charcoal catches (about 5-10 minutes).\n   • Advantages: Chemical-free, easy to use, and convenient.\n\n3. Chimney Starter:\n   • Fill a chimney starter 1/4-1/3 full with charcoal.\n   • Light paper underneath and let burn until coals are partially lit (about 10-15 minutes).\n   • Pour lit coals on top of unlit charcoal in the cooker for a longer burn.\n   • Advantages: Creates a hot start quickly, good for higher temperature cooking.\n\n4. Torch Methods:\n   • MAPP gas or propane torch applied to the charcoal for 30-60 seconds.\n   • Allow 10-15 minutes for fire to establish before closing lid.\n   • Advantages: Very fast and effective, especially in cold or damp weather.\n\nNever use lighter fluid in ceramic cookers as it can permeate the porous ceramic and affect food flavor.",
    category: "Using Ceramic Cookers",
    keywords: ["light", "lighting", "charcoal", "starter", "fire", "start", "torch"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-airflow",
    question: "How does airflow work in a ceramic cooker?",
    answer: "Understanding airflow in a ceramic cooker:\n\n1. Basic Principle:\n   • Ceramic cookers operate on a chimney effect (natural convection).\n   • Cool air enters through the bottom vent, heats up as it passes through the burning charcoal, and exits through the top vent.\n   • More airflow = more oxygen = hotter fire.\n\n2. Bottom Vent Function:\n   • Primary intake control that regulates how much oxygen enters the cooker.\n   • Has the largest effect on temperature.\n   • Wide open allows maximum airflow for high heat; nearly closed creates minimal airflow for low temperatures.\n\n3. Top Vent Function:\n   • Controls how much hot air and smoke exits the cooker.\n   • Helps fine-tune the temperature and manage smoke density.\n   • Never fully close the top vent during cooking to prevent backdraft conditions and ensure proper combustion.\n\n4. Temperature Control Through Vents:\n   • To increase temperature: Open vents wider.\n   • To decrease temperature: Close vents (partially).\n   • For precise control, make small adjustments (1/8\" at a time) and wait 15-20 minutes to see full effect.\n   • Bottom vent makes larger temperature changes; top vent makes fine adjustments.\n\n5. Internal Configuration Effect:\n   • Direct setup (no heat deflector) allows more direct airflow and higher temperatures.\n   • Indirect setup (with ConvEGGtor/plate setter) creates more complex convection currents and generally lower maximum temperatures.",
    category: "Temperature Control",
    keywords: ["airflow", "vents", "oxygen", "circulation", "temperature", "control", "convection"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-temperature-range",
    question: "What temperature ranges are ideal for different cooking techniques on a ceramic cooker?",
    answer: "Ideal temperature ranges for different cooking techniques on a ceramic cooker:\n\n1. Cold Smoking:\n   • 70-90°F (21-32°C)\n   • For cheese, salt, nuts, and delicate items.\n   • Requires special setup to keep temperatures very low.\n\n2. Traditional Smoking (Low & Slow):\n   • 225-250°F (107-121°C)\n   • For brisket, pork butt, ribs, and other traditional barbecue.\n   • Indirect setup with ConvEGGtor/plate setter.\n\n3. Roasting:\n   • 300-350°F (149-177°C)\n   • For poultry, prime rib, vegetables.\n   • Indirect setup for most items.\n\n4. Baking:\n   • 350-400°F (177-204°C)\n   • For bread, pizza with thick crust, desserts.\n   • Indirect setup with baking stone.\n\n5. High-Temperature Roasting:\n   • 400-500°F (204-260°C)\n   • For whole chicken, turkey, vegetables.\n   • Indirect setup for most items.\n\n6. Pizza (Neapolitan style):\n   • 600-750°F (316-399°C)\n   • For thin crust pizzas.\n   • Indirect setup with pizza stone.\n\n7. Searing/Grilling:\n   • 500-750°F (260-399°C)\n   • For steaks, chops, burgers.\n   • Direct setup over coals.\n\nCeramic cookers excel at maintaining stable temperatures throughout these ranges, unlike many other cooker types that may struggle at the extremes.",
    category: "Temperature Control",
    keywords: ["temperature", "range", "smoking", "roasting", "baking", "grilling", "searing"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-cost",
    question: "Why are ceramic cookers so expensive?",
    answer: "Ceramic cookers command premium prices for several reasons:\n\n1. Materials & Construction:\n   • High-quality ceramic materials capable of withstanding extreme temperature variations are costly.\n   • The thick-walled, double-glazed construction requires significantly more raw materials than metal grills.\n   • Each cooker undergoes multiple high-temperature firings during manufacturing.\n\n2. Manufacturing Process:\n   • Involves skilled labor and time-intensive production methods.\n   • Quality control for ceramic products is rigorous, with higher rejection rates than metal products.\n   • Limited production facilities worldwide capable of manufacturing these specialized ceramics.\n\n3. Durability & Longevity:\n   • Built to last decades rather than years (many users report 15-20+ years of service).\n   • When calculating cost-per-year of ownership, they often become more economical than replacing cheaper grills every few years.\n\n4. Fuel Efficiency:\n   • Use significantly less charcoal than conventional grills.\n   • A typical ceramic cooker might use 25-50% of the fuel required by metal alternatives.\n\n5. Versatility:\n   • Functions as multiple cooking appliances (smoker, grill, oven, pizza oven).\n   • Replacing several single-purpose cooking devices with one versatile unit.\n\n6. Brand Premium:\n   • Established brands invest heavily in research, development, and customer service.\n   • Warranties often extend for the lifetime of the ceramic components.\n\nMany owners consider them an investment rather than a purchase, given their durability and versatility.",
    category: "Buying Ceramic Cookers",
    keywords: ["expensive", "cost", "price", "value", "worth it", "investment"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  },
  {
    id: "ceramic-cooker-choosing-size",
    question: "How do I choose the right size ceramic cooker?",
    answer: "Factors to consider when choosing the right size ceramic cooker:\n\n1. Cooking Capacity Needs:\n   • Small (13-14\"): 4-6 burgers, 1 chicken, ideal for 1-2 people\n   • Medium (15-16\"): 8-10 burgers, 1 turkey, good for 2-4 people\n   • Large (18-19\"): 12-16 burgers, 2 chickens or 1 large turkey, perfect for 4-8 people\n   • XL (22-24\"): 20+ burgers, multiple racks of ribs, great for 8+ people or entertaining\n   • 2XL (24-29\"): Commercial capacity for large gatherings or restaurant use\n\n2. Space Considerations:\n   • Remember to account for the footprint of the cooker plus clearance needed around it for safety (minimum 2 feet from structures).\n   • Consider the weight - larger models can weigh 200-400 pounds and may require reinforced surfaces.\n\n3. Portability Requirements:\n   • Smaller models (Mini, MiniMax) are designed for portability and travel.\n   • Larger models are effectively permanent installations once set up.\n\n4. Versatility vs. Specialization:\n   • Medium to Large sizes offer the best all-around versatility.\n   • XL and 2XL excel at entertaining and large cuts but use more fuel for smaller cooks.\n   • Smaller sizes heat up faster and use less fuel but limit cooking techniques for larger items.\n\n5. Budget Considerations:\n   • Larger sizes cost significantly more, both for the initial purchase and accessories.\n   • Larger models use more fuel per cook.\n\nMost experienced users recommend buying one size larger than you initially think you need, as many find themselves wanting more cooking space over time.",
    category: "Buying Ceramic Cookers",
    keywords: ["size", "choose", "selection", "dimensions", "capacity", "space"],
    source: "https://www.nakedwhiz.com/ceramicfaq.htm"
  }
];

// Function to search for FAQs based on user query
export function searchFAQs(query: string, maxResults: number = 3): FAQ[] {
  const lowerQuery = query.toLowerCase();
  
  // Score each FAQ based on keyword matches and question similarity
  const scoredFAQs = faqData.map(faq => {
    let score = 0;
    
    // Check for exact question match (highest priority)
    if (faq.question.toLowerCase() === lowerQuery) {
      score += 100;
    }
    
    // Check if query is contained in the question
    if (faq.question.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }
    
    // Check for keyword matches
    faq.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });
    
    // Check for word matches in question
    const queryWords = lowerQuery.split(/\s+/);
    const questionWords = faq.question.toLowerCase().split(/\s+/);
    
    queryWords.forEach(word => {
      if (word.length > 3 && questionWords.includes(word)) {
        score += 5;
      }
    });
    
    return { faq, score };
  });
  
  // Sort by score (descending) and return top results
  return scoredFAQs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.faq);
}

// Function to generate a response from FAQ matches
export function generateFAQResponse(faqs: FAQ[]): string {
  if (faqs.length === 0) {
    return "";
  }
  
  if (faqs.length === 1) {
    const faq = faqs[0];
    return `${faq.answer}`;
  }
  
  // Multiple matches
  let response = "I found several answers that might help:\n\n";
  
  faqs.forEach((faq, index) => {
    response += `**${faq.question}**\n${faq.answer}\n\n`;
  });
  
  return response;
} 