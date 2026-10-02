export function getStoredUser() {
  return localStorage.getItem("user") || sessionStorage.getItem("user");
}
