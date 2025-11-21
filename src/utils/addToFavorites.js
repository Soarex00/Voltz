// Adicionar produto aos favoritos
export function addToFavorites(product) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || []

    const exists = favorites.find(item => item.id === product.id)

    if (exists) {
        // Se já existe, remove dos favoritos
        const newFavorites = favorites.filter(item => item.id !== product.id)
        localStorage.setItem("favorites", JSON.stringify(newFavorites))
        return false // Retorna false para indicar que foi removido
    } else {
        // Se não existe, adiciona aos favoritos
        favorites.push(product)
        localStorage.setItem("favorites", JSON.stringify(favorites))
        return true // Retorna true para indicar que foi adicionado
    }
}

// Verificar se produto está nos favoritos
export function isFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || []
    return favorites.some(item => item.id === productId)
}

// Obter todos os favoritos
export function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || []
}
