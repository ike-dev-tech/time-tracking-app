// Application color palette
export const colors = {
  primary: "#4A90E2", // Sky blue
  secondary: "#FF9500", // Orange
  accent: "#34C759", // Green
  background: {
    light: "#F5F5F5", // Light grey
    dark: "#121212", // Dark background
  },
  text: {
    light: "#333333", // Dark grey
    dark: "#E0E0E0", // Light grey for dark mode
  },
  activity: {
    red: "#E74C3C",
    purple: "#9B59B6",
    blue: "#4A90E2",
    orange: "#FF9500",
    green: "#34C759",
    gray: "#95A5A6", // For "Other" category
  },
};

// Map color string to hex value
export function getColorByName(colorName: string): string {
  switch (colorName.toLowerCase()) {
    case "red":
      return colors.activity.red;
    case "purple":
      return colors.activity.purple;
    case "blue":
      return colors.activity.blue;
    case "orange":
      return colors.activity.orange;
    case "green":
      return colors.activity.green;
    default:
      return colorName; // Assume it's already a hex color
  }
}

// Default category colors
export const defaultCategoryColors = [
  colors.activity.red,
  colors.activity.blue,
  colors.activity.green,
  colors.activity.purple,
  colors.activity.orange,
];

// Get contrasting text color for a background
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return white for dark backgrounds, black for light
  return brightness > 128 ? "#000000" : "#FFFFFF";
}
