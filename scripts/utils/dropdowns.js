// Fonction pour créer les boutons de filtre
export function createFiltersButtons(recipes, selectIngredientCallback) {
    const filtersButtonsDiv = document.querySelector('.dropdowns');
    if (!filtersButtonsDiv) {
        console.error("La div .dropdowns n'existe pas dans le DOM.");
        return;
    }

    let dropdownIngredients = document.querySelector('#dropdownIngredients');
    if (!dropdownIngredients) {
        dropdownIngredients = document.createElement('div');
        dropdownIngredients.className = 'dropdown-wrapper';
        dropdownIngredients.id = 'dropdownIngredients';

        const ingredientsButton = document.createElement('button');
        ingredientsButton.className = 'dropdown';
        ingredientsButton.type = 'button';
        ingredientsButton.id = 'dropdownIngredientsButton';
        ingredientsButton.setAttribute('aria-haspopup', 'listbox');
        ingredientsButton.setAttribute('aria-expanded', 'false');
        ingredientsButton.setAttribute('aria-label', 'filtre ingrédients');

        const ingredientsTextSpan = document.createElement('span');
        ingredientsTextSpan.textContent = 'Ingrédients';
        ingredientsButton.appendChild(ingredientsTextSpan);

        const iconIngredients = document.createElement('i');
        iconIngredients.className = 'fa-solid fa-angle-down dropdown-icon';
        ingredientsButton.appendChild(iconIngredients);

        dropdownIngredients.appendChild(ingredientsButton);

        const ingredientsContent = document.createElement('div');
        ingredientsContent.className = 'dropdown-content';
        ingredientsContent.setAttribute('role', 'listbox');
        ingredientsContent.setAttribute('aria-labelledby', 'dropdownIngredientsButton');

        dropdownIngredients.appendChild(ingredientsContent);
        filtersButtonsDiv.appendChild(dropdownIngredients);

        filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes, selectIngredientCallback);
    }
}

// Fonction pour gérer les événements sur les boutons de filtre
function filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes, selectIngredientCallback) {
    ingredientsButton.addEventListener('click', () => {
        const isExpanded = ingredientsButton.getAttribute("aria-expanded") === "true";
        ingredientsButton.setAttribute("aria-expanded", !isExpanded);
        ingredientsButton.classList.toggle('show');

        if (iconIngredients) {
            iconIngredients.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        ingredientsContent.style.display = isExpanded ? 'none' : 'block';

        if (!isExpanded) {
            createIngredientsSearch(ingredientsContent, recipes, selectIngredientCallback);
        }
    });
}

// Fonction pour créer la zone de recherche des ingrédients
function createIngredientsSearch(ingredientsContent, recipes, selectIngredientCallback) {
    if (!ingredientsContent.querySelector('.search-filters')) {
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'sticky';
        searchContainer.style.top = '0';
        searchContainer.style.backgroundColor = 'white';
        searchContainer.style.zIndex = '1';
        searchContainer.style.padding = '10px 0 0 0';

        const ingredientsSearch = document.createElement('input');
        ingredientsSearch.classList.add('search-filters');
        ingredientsSearch.setAttribute('type', 'search');
        ingredientsSearch.setAttribute('id', 'ingredients');
        ingredientsSearch.setAttribute('name', 'ingredients');
        ingredientsSearch.setAttribute('aria-label', 'rechercher parmi les ingrédients');

        const iconSearch = document.createElement('i');
        iconSearch.className = 'fa-solid fa-magnifying-glass filters-icon';
        iconSearch.setAttribute('aria-hidden', 'true');

        const clearIcon = document.createElement('i');
        clearIcon.className = 'fa-solid fa-xmark clear-icon';
        clearIcon.setAttribute('aria-label', 'croix pour supprimer la saisie');
        clearIcon.style.display = 'none';

        searchContainer.appendChild(iconSearch);
        searchContainer.appendChild(ingredientsSearch);
        searchContainer.appendChild(clearIcon);
        ingredientsContent.appendChild(searchContainer);

        // Nettoyage des doublons en normalisant les ingrédients en minuscules
        const ingredientsList = [...new Set(
            recipes.flatMap(recipe => 
                recipe.ingredients.map(ing => ing.ingredient.toLowerCase())
            )
        )];

        const ingredientsListContainer = document.createElement('div');
        ingredientsListContainer.className = 'ingredients-list-container';
        ingredientsContent.appendChild(ingredientsListContainer);

        function displayIngredientsList(filteredIngredients) {
            ingredientsListContainer.innerHTML = '';
            filteredIngredients.forEach(ingredient => {
                const ingredientItem = document.createElement('div');
                ingredientItem.className = 'ingredient-item';
                ingredientItem.textContent = ingredient;
                ingredientItem.addEventListener('click', () => {
                    selectIngredientCallback(ingredient);
                });
                ingredientsListContainer.appendChild(ingredientItem);
            });
        }

        displayIngredientsList(ingredientsList);

        ingredientsSearch.addEventListener('input', () => {
            const query = ingredientsSearch.value.toLowerCase().trim();
            clearIcon.style.display = query ? 'block' : 'none';
            const filteredIngredients = ingredientsList.filter(ingredient =>
                ingredient.toLowerCase().includes(query)
            );
            displayIngredientsList(filteredIngredients);
        });

        clearIcon.addEventListener('click', () => {
            ingredientsSearch.value = '';
            clearIcon.style.display = 'none';
            displayIngredientsList(ingredientsList);
        });
    }
}
