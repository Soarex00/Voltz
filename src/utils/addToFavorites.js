export function addToFavorites(product) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const exists = favorites.find((item) => item.id === product.id);

  if (exists) {
    const newFavorites = favorites.filter((item) => item.id !== product.id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    return false;
  } else {
    favorites.push(product);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    return true;
  }
}

export function isFavorite(productId) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  return favorites.some((item) => item.id === productId);
}

export function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}
