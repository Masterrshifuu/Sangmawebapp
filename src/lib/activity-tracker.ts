
'use client';

const ACTIVITY_STORAGE_KEY = 'userProductActivity';
const MAX_ACTIVITY_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_ITEMS = 100; // Limit the number of items to prevent localStorage overflow

interface ActivityItem {
  id: string; // Product ID, category name, or search term
  type: 'view' | 'category' | 'search';
  timestamp: number;
}

function getActivities(): ActivityItem[] {
  try {
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!storedActivities) return [];
    
    const activities: ActivityItem[] = JSON.parse(storedActivities);
    const now = Date.now();
    
    // Filter out old activities
    return activities.filter(activity => (now - activity.timestamp) < MAX_ACTIVITY_AGE);
  } catch (error) {
    console.error("Error reading user activity from localStorage", error);
    return [];
  }
}

function saveActivities(activities: ActivityItem[]): void {
  try {
    // Keep only the most recent activities to avoid storage limits
    const recentActivities = activities.slice(-MAX_ITEMS);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(recentActivities));
  } catch (error) {
    console.error("Error saving user activity to localStorage", error);
  }
}

function addActivity(id: string, type: 'view' | 'category' | 'search'): void {
  let activities = getActivities();
  
  // Create a new activity record
  const newActivity: ActivityItem = { id, type, timestamp: Date.now() };

  // Add the new activity
  activities.push(newActivity);
  
  saveActivities(activities);
}

export function trackProductView(productId: string, category: string): void {
  addActivity(productId, 'view');
  addActivity(category, 'category');
}

export function trackSearch(query: string): void {
  addActivity(query, 'search');
}

export function getUserActivity() {
  const activities = getActivities();
  const activitySummary = {
    viewedProductIds: new Set<string>(),
    viewedCategories: new Set<string>(),
    searchTerms: new Set<string>(),
  };

  for (const activity of activities) {
    switch (activity.type) {
      case 'view':
        activitySummary.viewedProductIds.add(activity.id);
        break;
      case 'category':
        activitySummary.viewedCategories.add(activity.id);
        break;
      case 'search':
        // Add individual words from search query to broaden matching
        activity.id.toLowerCase().split(' ').forEach(term => {
          if (term.length > 2) activitySummary.searchTerms.add(term)
        });
        break;
    }
  }

  return activitySummary;
}
