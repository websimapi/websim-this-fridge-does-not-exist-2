// Utility functions for fridge generation

// Map common food types to emoji
export const foodTypeToEmoji = {
  milk: '🥛',
  cheese: '🧀',
  yogurt: '🥣',
  butter: '🧈',
  egg: '🥚',
  meat: '🥩',
  chicken: '🍗',
  fish: '🐟',
  fruit: '🍎',
  apple: '🍎',
  banana: '🍌',
  orange: '🍊',
  grape: '🍇',
  lemon: '🍋',
  strawberry: '🍓',
  vegetables: '🥗',
  carrot: '🥕',
  broccoli: '🥦',
  tomato: '🍅',
  potato: '🥔',
  lettuce: '🥬',
  cucumber: '🥒',
  bread: '🍞',
  cake: '🍰',
  pizza: '🍕',
  soda: '🥤',
  beer: '🍺',
  wine: '🍷',
  water: '🥛',
  juice: '🧃',
  chocolate: '🍫',
  candy: '🍬',
  ice: '🧊',
  ice_cream: '🍦',
  leftovers: '🥡',
  default: '🍽️'
};

// Get a suitable emoji for a food item
export const getFoodEmoji = (foodName) => {
  const lowerCaseName = foodName.toLowerCase();
  
  // Check for direct matches
  for (const [key, emoji] of Object.entries(foodTypeToEmoji)) {
    if (lowerCaseName.includes(key)) {
      return emoji;
    }
  }
  
  // Default emoji if no match found
  return foodTypeToEmoji.default;
};

// Function to determine shelf placement
export const determineShelfPlacement = (foodType) => {
  const type = foodType.toLowerCase();
  
  if (['milk', 'juice', 'water', 'soda', 'beer', 'wine'].some(item => type.includes(item))) {
    return 'door';
  }
  
  if (['vegetable', 'carrot', 'broccoli', 'lettuce', 'cucumber', 'tomato'].some(item => type.includes(item))) {
    return 'drawer';
  }
  
  if (['meat', 'chicken', 'fish', 'leftovers'].some(item => type.includes(item))) {
    return 'bottom shelf';
  }
  
  if (['yogurt', 'cheese', 'butter', 'egg'].some(item => type.includes(item))) {
    return 'middle shelf';
  }
  
  return 'top shelf';
};

