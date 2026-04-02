// Common Indian food calorie database (per serving)
const calorieDatabase = {
  // Breakfast items
  "dosa": 120,
  "masala dosa": 200,
  "plain dosa": 120,
  "idli": 60,
  "vada": 130,
  "medu vada": 130,
  "upma": 180,
  "poha": 160,
  "paratha": 200,
  "aloo paratha": 280,
  "gobi paratha": 240,
  "paneer paratha": 300,
  "puri": 120,
  "chole bhature": 450,
  "bhature": 200,
  "uttapam": 150,
  "pongal": 200,
  "appam": 100,
  "puttu": 180,
  "pesarattu": 150,
  "chapati": 100,
  "roti": 100,
  "naan": 170,
  "butter naan": 250,
  "garlic naan": 230,
  "kulcha": 200,
  "bhakri": 120,

  // Rice dishes
  "rice": 200,
  "biryani": 400,
  "chicken biryani": 450,
  "mutton biryani": 500,
  "veg biryani": 350,
  "egg biryani": 400,
  "pulao": 250,
  "veg pulao": 250,
  "jeera rice": 220,
  "fried rice": 300,
  "lemon rice": 230,
  "curd rice": 220,
  "khichdi": 200,
  "dal khichdi": 220,

  // Curries & gravies
  "dal": 150,
  "dal fry": 180,
  "dal tadka": 180,
  "dal makhani": 300,
  "rajma": 250,
  "chole": 240,
  "chana masala": 240,
  "kadhi": 180,
  "paneer butter masala": 350,
  "paneer tikka masala": 320,
  "shahi paneer": 340,
  "palak paneer": 280,
  "matar paneer": 290,
  "malai kofta": 400,
  "aloo gobi": 200,
  "aloo matar": 220,
  "baingan bharta": 180,
  "bhindi masala": 160,
  "mixed veg": 180,
  "veg korma": 280,
  "navratan korma": 300,
  "egg curry": 250,
  "butter chicken": 400,
  "chicken curry": 350,
  "chicken tikka": 250,
  "tandoori chicken": 260,
  "fish curry": 280,
  "fish fry": 250,
  "mutton curry": 400,
  "keema": 350,
  "prawn curry": 250,

  // Snacks
  "samosa": 150,
  "kachori": 200,
  "pakora": 100,
  "bhel puri": 180,
  "pani puri": 150,
  "sev puri": 180,
  "pav bhaji": 350,
  "dabeli": 200,
  "sandwich": 200,
  "grilled sandwich": 250,
  "vada pav": 250,
  "misal pav": 350,
  "dhokla": 120,
  "khandvi": 130,
  "cutlet": 150,
  "spring roll": 150,
  "momos": 200,

  // Accompaniments
  "chutney": 30,
  "coconut chutney": 50,
  "raita": 80,
  "pickle": 20,
  "papad": 50,
  "salad": 50,
  "green salad": 30,

  // Desserts & sweets
  "gulab jamun": 150,
  "rasgulla": 120,
  "jalebi": 150,
  "ladoo": 180,
  "barfi": 160,
  "halwa": 200,
  "kheer": 200,
  "payasam": 220,
  "rasmalai": 180,
  "kulfi": 150,
  "ice cream": 200,
  "gajar ka halwa": 250,

  // Beverages
  "chai": 80,
  "tea": 80,
  "coffee": 100,
  "filter coffee": 100,
  "lassi": 180,
  "sweet lassi": 200,
  "buttermilk": 60,
  "chaas": 60,
  "mango lassi": 220,
  "nimbu pani": 50,
  "coconut water": 50,
  "sugarcane juice": 120,
  "milk": 120,
  "badam milk": 180,
  "protein shake": 200,

  // South Indian
  "sambar": 120,
  "rasam": 60,
  "avial": 150,
  "thoran": 100,
  "kootu": 130,
  "poriyal": 100,

  // Non-veg extras
  "omelette": 150,
  "boiled egg": 70,
  "egg": 70,
  "fried egg": 120,
  "scrambled egg": 150,
  "chicken": 250,
  "fish": 200,
  "mutton": 300,
  "prawn": 100,

  // Common western/fusion
  "maggi": 300,
  "noodles": 300,
  "pasta": 350,
  "pizza": 250,
  "pizza slice": 250,
  "burger": 350,
  "french fries": 300,
  "wrap": 300,
  "rolls": 250,
  "egg roll": 280,
  "chicken roll": 350,

  // Health foods
  "oats": 150,
  "muesli": 200,
  "sprouts": 100,
  "fruit": 80,
  "banana": 90,
  "apple": 70,
  "yogurt": 100,
  "curd": 100,
  "paneer": 200,
  "tofu": 100,
  "soya chunk": 150,
  "brown rice": 180,
  "quinoa": 180,
  "millet": 170,
  "ragi": 160,
};

// Parse a dish string like "2 dosa and chutney" into estimated calories
export function estimateCalories(input) {
  if (!input || !input.trim()) return { total: 0, breakdown: [] };

  const text = input.toLowerCase().trim();
  const breakdown = [];
  let total = 0;

  // Split by common separators
  const parts = text.split(/\s*(?:,|and|&|\+|with)\s*/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Extract quantity (e.g., "2 dosa" -> quantity=2, item="dosa")
    const qtyMatch = trimmed.match(/^(\d+\.?\d*)\s*(.+)/);
    let quantity = 1;
    let itemName = trimmed;

    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]);
      itemName = qtyMatch[2].trim();
    }

    // Try exact match first, then partial matches
    let caloriesPerServing = null;
    let matchedName = itemName;

    if (calorieDatabase[itemName]) {
      caloriesPerServing = calorieDatabase[itemName];
      matchedName = itemName;
    } else {
      // Try partial matching
      const keys = Object.keys(calorieDatabase);
      // Sort by length descending to prefer longer (more specific) matches
      const sorted = keys.sort((a, b) => b.length - a.length);
      for (const key of sorted) {
        if (itemName.includes(key) || key.includes(itemName)) {
          caloriesPerServing = calorieDatabase[key];
          matchedName = key;
          break;
        }
      }
    }

    if (caloriesPerServing !== null) {
      const itemTotal = Math.round(caloriesPerServing * quantity);
      breakdown.push({
        item: matchedName,
        quantity,
        caloriesPerServing,
        total: itemTotal,
      });
      total += itemTotal;
    } else {
      // Default estimate for unknown items
      const defaultCal = 150;
      const itemTotal = Math.round(defaultCal * quantity);
      breakdown.push({
        item: itemName,
        quantity,
        caloriesPerServing: defaultCal,
        total: itemTotal,
        estimated: true,
      });
      total += itemTotal;
    }
  }

  return { total, breakdown };
}

export default calorieDatabase;
