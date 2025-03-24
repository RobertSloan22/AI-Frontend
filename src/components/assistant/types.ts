export interface ItemType {
    id: string;
    role: 'user' | 'assistant';
    formatted: {
      text?: string;
      transcript?: string;
    };
    // Add other properties as needed
  }

export interface SavedImage {
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  source: string;
}

