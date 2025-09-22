import { create } from 'zustand';

interface FavoriteItem {
  scaleId: string;
  id: string;
  notes?: string;
  createdAt: Date;
}

interface FavoritesState {
  // 状态
  favorites: Map<string, FavoriteItem>; // scaleId -> FavoriteItem
  isLoading: boolean;
  lastFetched: Date | null;
  
  // 计算属性
  favoriteScaleIds: string[];
  
  // 操作
  setFavorites: (favorites: FavoriteItem[]) => void;
  addFavorite: (scaleId: string, favoriteData: Partial<FavoriteItem>) => void;
  removeFavorite: (scaleId: string) => void;
  isFavorited: (scaleId: string) => boolean;
  getFavorite: (scaleId: string) => FavoriteItem | undefined;
  
  // 批量操作
  fetchUserFavorites: () => Promise<void>;
  toggleFavorite: (scaleId: string, options?: { notes?: string }) => Promise<boolean>;
  
  // 工具方法
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  // 初始状态
  favorites: new Map(),
  isLoading: false,
  lastFetched: null,
  
  // 计算属性
  get favoriteScaleIds() {
    return Array.from(get().favorites.keys());
  },
  
  // 设置收藏列表
  setFavorites: (favoritesList: FavoriteItem[]) => {
    const favoritesMap = new Map();
    favoritesList.forEach(fav => {
      favoritesMap.set(fav.scaleId, fav);
    });
    
    set({
      favorites: favoritesMap,
      lastFetched: new Date()
    });
  },
  
  // 添加收藏
  addFavorite: (scaleId: string, favoriteData: Partial<FavoriteItem>) => {
    set(state => {
      const newFavorites = new Map(state.favorites);
      newFavorites.set(scaleId, {
        scaleId,
        id: favoriteData.id || `fav_${Date.now()}`,
        notes: favoriteData.notes,
        createdAt: favoriteData.createdAt || new Date()
      });
      
      return { favorites: newFavorites };
    });
  },
  
  // 移除收藏
  removeFavorite: (scaleId: string) => {
    set(state => {
      const newFavorites = new Map(state.favorites);
      newFavorites.delete(scaleId);
      
      return { favorites: newFavorites };
    });
  },
  
  // 检查是否已收藏
  isFavorited: (scaleId: string) => {
    return get().favorites.has(scaleId);
  },
  
  // 获取收藏详情
  getFavorite: (scaleId: string) => {
    return get().favorites.get(scaleId);
  },
  
  // 批量获取用户收藏
  fetchUserFavorites: async () => {
    const state = get();
    
    // 避免频繁请求（5分钟内不重复请求）
    if (state.lastFetched && Date.now() - state.lastFetched.getTime() < 5 * 60 * 1000) {
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/user/favorites');
      const data = await response.json();
      
      if (data.success && data.favorites) {
        const favoriteItems: FavoriteItem[] = data.favorites.map((fav: any) => ({
          scaleId: fav.scaleId,
          id: fav.id,
          notes: fav.notes,
          createdAt: new Date(fav.createdAt)
        }));
        
        get().setFavorites(favoriteItems);
      }
    } catch (error) {
      console.error('批量获取收藏失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // 切换收藏状态
  toggleFavorite: async (scaleId: string, options = {}) => {
    const state = get();
    const wasFavorited = state.isFavorited(scaleId);
    
    try {
      const response = await fetch(`/api/scales/${scaleId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.action === 'added') {
          state.addFavorite(scaleId, {
            notes: options.notes,
            createdAt: new Date()
          });
          return true; // 新增收藏
        } else {
          state.removeFavorite(scaleId);
          return false; // 移除收藏
        }
      } else {
        throw new Error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error);
      throw error;
    }
  },
  
  // 清空收藏
  clearFavorites: () => {
    set({
      favorites: new Map(),
      lastFetched: null
    });
  },
  
  // 获取收藏数量
  getFavoritesCount: () => {
    return get().favorites.size;
  }
}));