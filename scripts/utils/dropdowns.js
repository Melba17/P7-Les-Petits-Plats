///// Fonction pour créer le squelette des boutons de filtres /////
export function createFiltersButtons(recipes) {
    const filtersButtonsDiv = document.querySelector('.dropdowns'); // Récupère la div contenant les boutons de filtres
    if (!filtersButtonsDiv) {
        console.error("La div .dropdowns n'existe pas dans le DOM."); // Affiche une erreur si la div n'existe pas
        return;
    }

    const dropdownIngredients = document.createElement('div'); 
    
    // Crée le bouton Ingrédients
    const ingredientsButton = document.createElement('button');
    ingredientsButton.className = 'dropdown'; 
    ingredientsButton.type = 'button'; 
    ingredientsButton.id = 'dropdownIngredients'; 
    ingredientsButton.setAttribute('aria-haspopup', 'listbox'); 
    ingredientsButton.setAttribute('aria-expanded', 'false'); 
    ingredientsButton.setAttribute('aria-label', 'filtre ingrédients');

    // Ajouter le texte à l'intérieur du bouton
    const ingredientsTextSpan = document.createElement('span'); // 
    ingredientsTextSpan.textContent = 'Ingrédients'; 
    ingredientsButton.appendChild(ingredientsTextSpan); // Ajoute le texte au bouton

    // Ajouter l'icône de la flèche
    const iconIngredients = document.createElement('i'); 
    iconIngredients.className = 'fa-solid fa-angle-down dropdown-icon'; 
    ingredientsButton.appendChild(iconIngredients); 

    // Ajouter l'ensemble bouton au conteneur dropdownIngredients
    dropdownIngredients.appendChild(ingredientsButton); 

    // Interieur du menu déroulant
    const ingredientsContent = document.createElement('div'); 
    ingredientsContent.className = 'dropdown-content'; 
    ingredientsContent.setAttribute('role', 'listbox'); // 
    ingredientsContent.setAttribute('aria-labelledby', 'dropdownIngredients');
    ingredientsContent.style.display = 'none';  // Masqué par défaut
    
    // Ajoute le contenu au conteneur dropdownIngredients
    dropdownIngredients.appendChild(ingredientsContent);

    // Ajoute dropdownIngredients à la div principale
    filtersButtonsDiv.appendChild(dropdownIngredients);

    filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes);

}


function filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes) {
    // Gestion de l'affichage/masquage du menu déroulant au clic
    ingredientsButton.addEventListener('click', () => {
        const isExpanded = ingredientsButton.getAttribute("aria-expanded") === "true";
        ingredientsButton.setAttribute("aria-expanded", !isExpanded);
        ingredientsButton.classList.toggle('show');
        iconIngredients.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        ingredientsContent.style.display = isExpanded ? 'none' : 'block';  // Affiche/masque le contenu du menu déroulant

        if (!isExpanded) {
            // Affiche la barre de recherche seulement lorsque le menu est ouvert
            createIngredientsSearch(ingredientsContent, recipes);
        }
    });
}

// Fonction pour créer la barre de recherche et la liste des ingrédients à l'intérieur du menu déroulant
function createIngredientsSearch(ingredientsContent, recipes) {
    // Si la barre de recherche n'est pas déjà créée
    if (!ingredientsContent.querySelector('.search-filters')) {
        // Conteneur pour le champ de recherche et l'icône
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'relative'; // Pour positionner l'icône de recherche à l'intérieur du menu déroulant

        const ingredientsSearch = document.createElement('input');
        ingredientsSearch.classList.add('search-filters');
        ingredientsSearch.setAttribute('type', 'search');
        ingredientsSearch.setAttribute('id', 'ingredients');
        ingredientsSearch.setAttribute('name', 'ingredients');
        ingredientsSearch.setAttribute('aria-label', 'Rechercher parmi les ingrédients');

        const iconSearch = document.createElement('i');
        iconSearch.className = 'fa-solid fa-magnifying-glass filters-icon';
        iconSearch.setAttribute('aria-hidden', 'true');

        // Ajouter l'icône et le champ de recherche au conteneur
        searchContainer.appendChild(iconSearch);
        searchContainer.appendChild(ingredientsSearch);
        ingredientsContent.appendChild(searchContainer);

        // Variable qui récupère la liste des ingrédients unique à partir des recettes
        // "map" transforme chaque objet ingredient en une simple chaîne de caractères 
        // "flatMap" aplatit le résultat pour que tous les ingrédients soient dans un seul tableau, sans sous-tableaux imbriqués
        // "new Set" est utilisé pour éliminer les doublons et obtenir une liste unique
        const ingredientsList = [...new Set(recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)))];

        // Ajouter chaque ingrédient dans le menu déroulant
        ingredientsList.forEach(ingredient => {
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'ingredient-item';
            ingredientItem.textContent = ingredient;
            ingredientsContent.appendChild(ingredientItem);
        });
    }
}