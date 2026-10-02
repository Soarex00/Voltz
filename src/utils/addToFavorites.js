import { getSessionUser } from '../services/session';
import { readStore, writeStore } from './store';
export function addToFavorites(product) {
  if (!getSessionUser() || getSessionUser().isAdmin) return false;
  const items = readStore('favorites'), exists = items.some(item => item.id === product.id);
  writeStore('favorites', exists ? items.filter(item => item.id !== product.id) : [...items, product]);
  return !exists;
}
export const getFavorites = () => readStore('favorites');
export const isFavorite = id => getFavorites().some(item => item.id === id);
