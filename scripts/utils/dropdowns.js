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

// Gestion de l'affichage/masquage du menu déroulant au clic
function filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes) {
    
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

// Fonction pour l'intérieur du menu déroulant
function createIngredientsSearch(ingredientsContent, recipes) {
    // Si la barre de recherche n'est pas déjà créée
    if (!ingredientsContent.querySelector('.search-filters')) {
        // Conteneur pour le champ de recherche et l'icône
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'sticky';
        searchContainer.style.top = '0';
        searchContainer.style.backgroundColor = 'white';
        searchContainer.style.zIndex = '1'; // Pour s'assurer qu'elle reste au-dessus de la liste des ingrédients
        searchContainer.style.padding = '10px 0 0 0'; // Ajout d'un padding pour un meilleur espacement

        // Barre de recherche
        const ingredientsSearch = document.createElement('input');
        ingredientsSearch.classList.add('search-filters');
        ingredientsSearch.setAttribute('type', 'search');
        ingredientsSearch.setAttribute('id', 'ingredients');
        ingredientsSearch.setAttribute('name', 'ingredients');
        ingredientsSearch.setAttribute('aria-label', 'rechercher parmi les ingrédients');

        // Icône loupe de recherche
        const iconSearch = document.createElement('i');
        iconSearch.className = 'fa-solid fa-magnifying-glass filters-icon';
        iconSearch.setAttribute('aria-hidden', 'true');

        // Icône croix pour vider le champ de recherche
        const clearIcon = document.createElement('i');
        clearIcon.className = 'fa-solid fa-xmark clear-icon'; 
        clearIcon.setAttribute('aria-label', 'croix pour supprimer la saisie');
        clearIcon.style.position = 'absolute';
        clearIcon.style.display = 'none'; // Masqué par défaut

        // Ajoute les icônes et le champ de recherche au conteneur
        searchContainer.appendChild(iconSearch);
        searchContainer.appendChild(ingredientsSearch);
        searchContainer.appendChild(clearIcon);
        ingredientsContent.appendChild(searchContainer);

        
        // Variable qui récupère la liste des ingrédients unique à partir des recettes
        // "map" transforme chaque objet ingredient en une simple chaîne de caractères 
        // "flatMap" aplatit le résultat pour que tous les ingrédients soient dans un seul tableau, sans sous-tableaux imbriqués
        // "new Set" est utilisé pour éliminer les doublons et obtenir une liste unique
        const ingredientsList = [...new Set(recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)))];

        // Conteneur pour la liste des ingrédients
        const ingredientsListContainer = document.createElement('div');
        ingredientsContent.appendChild(ingredientsListContainer);

        // Fonction pour afficher la liste des ingrédients filtrés
        function displayIngredientsList(filteredIngredients) {
            ingredientsListContainer.innerHTML = ''; // On vide la liste avant de la remplir
            filteredIngredients.forEach(ingredient => {
                const ingredientItem = document.createElement('div');
                ingredientItem.className = 'ingredient-item';
                ingredientItem.textContent = ingredient;
                
                ingredientsListContainer.appendChild(ingredientItem);
            });
        }

        // Affichage initial de la liste des ingrédients
        displayIngredientsList(ingredientsList);

        // Mise à jour de la liste des ingrédients en fonction de la recherche
        ingredientsSearch.addEventListener('input', () => {
            const query = ingredientsSearch.value.toLowerCase().trim();
            clearIcon.style.display = query ? 'block' : 'none'; // Affiche ou masque la croix

            // Filtre la liste des ingrédients en fonction de la requête de recherche (query). Pour chaque ingrédient de la liste "ingredientsList", la méthode `filter` vérifie si le nom de l'ingrédient, converti en minuscules avec `toLowerCase()`, contient la chaîne de caractères de la recherche (query), également convertie en minuscules. Seuls les ingrédients qui contiennent la requête seront inclus dans le tableau "filteredIngredients".
            const filteredIngredients = ingredientsList.filter(ingredient =>
                ingredient.toLowerCase().includes(query)
            );

            displayIngredientsList(filteredIngredients);
        });

        // Action pour vider le champ de recherche lorsqu'on clique sur la croix
        clearIcon.addEventListener('click', () => {
            ingredientsSearch.value = '';
            clearIcon.style.display = 'none'; 
            displayIngredientsList(ingredientsList); // Réinitialise la liste complète
        });
    }
}




        

        