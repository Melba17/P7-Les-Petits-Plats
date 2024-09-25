// initialize.js : POINT D'ENTRÉE POUR L'INITIALISATION DU PROJET

import { recipes } from './data/recipes.js';  
import { showRecipeCards, updateRecipeCounter } from './modules/ui.js';  
import { createFiltersButtons } from './modules/dropdown.js';
import { filterAndShowRecipes } from './modules/filter.js';
import { handleSearchInput } from './modules/searchVersion2.js';

/* //////////////////////////////////////////
   RÉCUPÉRATION DES DONNÉES DES RECETTES
////////////////////////////////////////// */
// Fonction pour récupérer les données des recettes depuis `recipes.js`.
export function getData() {
    return recipes;  // Retourne les données des recettes.
}

/* //////////////////////////////////////////
   INITIALISATION PRINCIPALE DU PROJET
////////////////////////////////////////// */
function initialize() {
    const data = getData();  // Récupère les données des recettes via la fonction `getData`.

    // Vérification des données récupérées : si elles sont manquantes ou invalides (non un tableau), un message d'erreur est affiché dans la console et l'initialisation s'arrête.
    if (!data || !Array.isArray(data)) {
        console.error('Les recettes sont manquantes ou invalides.');
        return;  // Arrête l'exécution de l'initialisation si les données sont incorrectes.
    }

    showRecipeCards(data);  // Affiche toutes les recettes récupérées sur l'interface utilisateur.
    updateRecipeCounter();  // Initialise ou réinitialise le compteur à 1500 recettes.
    createFiltersButtons(data); // Crée les boutons des filtres
    
    filterAndShowRecipes(data);  // Filtre et affiche les recettes selon les filtres appliqués.
    handleSearchInput(data);  // Gère les interactions de la barre de recherche principale avec les recettes disponibles.
}

// Appelle la fonction d'initialisation pour démarrer le projet
initialize();
