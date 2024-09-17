// Déclaration de la variable globale pour stocker les résultats de la recherche principale
let mainSearchResults = null;

/* //////////////////////////////////////////
   MISE À JOUR DES RÉSULTATS DE RECHERCHE
////////////////////////////////////////// */
export function setMainSearchResults(results) {
    // Cette fonction prend en entrée un tableau `results` (les nouveaux résultats de recherche)
    // et met à jour la variable globale `mainSearchResults` avec ces résultats.
    // Utilisée après un filtrage ou une mise à jour des recettes trouvées.
    mainSearchResults = results;
}

/* //////////////////////////////////////////
   ACCÈS AUX RÉSULTATS DE RECHERCHE
////////////////////////////////////////// */
export function getMainSearchResults() {
    // Cette fonction retourne la valeur actuelle de `mainSearchResults`.
    // Elle permet de récupérer les résultats stockés pour un affichage ou un filtrage ultérieur.
    return mainSearchResults;
}
