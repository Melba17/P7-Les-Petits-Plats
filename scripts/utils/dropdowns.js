export function createFiltersButtons(recipes) {
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

        filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes, filtersButtonsDiv);
    }
}

function filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes, filtersButtonsDiv) {
    ingredientsButton.addEventListener('click', () => {
        const isExpanded = ingredientsButton.getAttribute("aria-expanded") === "true";
        ingredientsButton.setAttribute("aria-expanded", !isExpanded);
        ingredientsButton.classList.toggle('show');

        if (iconIngredients) {
            iconIngredients.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        ingredientsContent.style.display = isExpanded ? 'none' : 'block';

        if (!isExpanded) {
            createIngredientsSearch(ingredientsContent, recipes, filtersButtonsDiv);
        }
    });
}

function createIngredientsSearch(ingredientsContent, recipes) {
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

        const ingredientsList = [...new Set(recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)))];

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
                    selectIngredient(ingredient);
                });
                ingredientsListContainer.appendChild(ingredientItem);
            });
        }

        function selectIngredient(ingredient) {
            // Vérifie s'il existe déjà un élément sélectionné
            let selectedItem = document.querySelector('.selected-item');
            if (!selectedItem) {
                // Crée un nouvel élément pour l'élément sélectionné
                selectedItem = document.createElement('div');
                selectedItem.className = 'selected-item';
        
                // Crée un conteneur pour le texte et l'icône de suppression
                const textContainer = document.createElement('span');
                textContainer.className = 'option-text';
                selectedItem.appendChild(textContainer);
        
                // Crée l'icône de suppression
                const closeIcon = document.createElement('i');
                closeIcon.className = 'fa-solid fa-xmark cross-item'; 
                closeIcon.setAttribute('aria-label', 'Supprimer la sélection');
                
                // Ajoute un gestionnaire d'événement pour supprimer l'élément sélectionné
                closeIcon.addEventListener('click', () => {
                    selectedItem.remove(); // Supprime l'élément sélectionné
                    document.querySelector('#dropdownIngredientsButton').setAttribute("aria-expanded", "false");
                    document.querySelector('#dropdownIngredientsButton').classList.remove('show');
                    document.querySelector('.dropdown-content').style.display = 'none';
        
                    // Réajuste la position de la grille
                    document.querySelector('.grid').style.marginTop = '30px'; // Ajustez cette valeur si nécessaire
                });
        
                // Ajoute l'icône de suppression au conteneur de texte
                selectedItem.appendChild(closeIcon);
        
                // Crée un conteneur pour les éléments sélectionnés si nécessaire
                let optionsContainer = document.querySelector('.options-container');
                if (!optionsContainer) {
                    optionsContainer = document.createElement('div');
                    optionsContainer.className = 'options-container';
                    const flexContainer = document.querySelector('.flex');
                    if (flexContainer) {
                        flexContainer.parentNode.insertBefore(optionsContainer, flexContainer.nextSibling);
                    }
                }
        
                // Ajoute l'élément sélectionné au conteneur des options
                optionsContainer.appendChild(selectedItem);
            }
            
            // Met à jour le texte de l'élément sélectionné
            const textContainer = selectedItem.querySelector('.option-text');
            textContainer.textContent = ingredient;
            selectedItem.style.display = 'block';
        
            // Ferme le menu déroulant
            document.querySelector('#dropdownIngredientsButton').setAttribute("aria-expanded", "false");
            document.querySelector('#dropdownIngredientsButton').classList.remove('show');
            document.querySelector('.dropdown-content').style.display = 'none';
        
            // Réajuste la position de la grille si nécessaire
            document.querySelector('.grid').style.marginTop = '50px'; // Ajustez cette valeur si nécessaire
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
