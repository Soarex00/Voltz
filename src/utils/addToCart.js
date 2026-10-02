import { getSessionUser } from '../services/session';
import { readStore, writeStore } from './store';
export function addToCart(product) {
  if (!getSessionUser() || getSessionUser().isAdmin) return false;
  const items = readStore('cart'), existing = items.find(item => item.id === product.id);
  if (existing) existing.quantity++; else items.push({ ...product, quantity: 1 });
  writeStore('cart', items); return true;
}
export const getCartItems = () => readStore('cart');
export const saveCartItems = items => writeStore('cart', items);
