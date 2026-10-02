export function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const exists = cart.find((item) => item.id === product.id);

  if (exists) {
    exists.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getCartItems() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
