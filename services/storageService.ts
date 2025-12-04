import { SavedItem } from '../types';

const STORAGE_KEY = 'greennova_saved_content';

export const getSavedItems = (): SavedItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse saved items", e);
    return [];
  }
};

export const saveItem = (item: Omit<SavedItem, 'id' | 'createdAt'>): boolean => {
  try {
    const items = getSavedItems();
    
    // Basic quota management - remove oldest if we have too many (e.g. > 50)
    if (items.length > 50) {
      items.pop();
    }

    const newItem: SavedItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    
    items.unshift(newItem); // Add to top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Storage failed", error);
    // If quota exceeded
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      alert("Storage quota exceeded. Please delete some saved items.");
    }
    return false;
  }
};

export const deleteItem = (id: string): SavedItem[] => {
  try {
    const items = getSavedItems();
    const newItems = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    return newItems;
  } catch (error) {
    console.error("Delete failed", error);
    return getSavedItems();
  }
};

// Helper to convert Blob URL to Base64 for storage
export const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
