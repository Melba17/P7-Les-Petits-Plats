////////////////////////// ROLE DU FICHIER DROPDOWNS.JS ///////////////////////////////////////////////////////////////////////////
///// Création des filtres : Il crée les boutons et les menus déroulants pour les filtres (par exemple, pour les ingrédients, appareils et ustensiles) sur la page.
///// Gestion des menus déroulants : Il gère l'affichage et le comportement des menus lorsque l'utilisateur clique dessus (par exemple, ouvrir ou fermer le menu).
/////// EN BREF : s’occupe de comment les utilisateurs peuvent faire leurs choix (créer et gérer les menus de filtres).


// Fonction pour créer les boutons de filtre
export function createFiltersButtons(recipes, selectIngredientCallback, selectApplianceCallback, selectUstensilCallback) {
    const filtersButtonsDiv = document.querySelector('.dropdowns');
    if (!filtersButtonsDiv) {
        console.error("La div .dropdowns n'existe pas dans le DOM.");
        return;
    }

    // Créer le bouton pour les ingrédients
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

        filtersButtonsDOM(ingredientsButton, ingredientsContent, iconIngredients, recipes, selectIngredientCallback, createIngredientsSearch);
    }

    // Créer le bouton pour les appareils
    let dropdownAppliances = document.querySelector('#dropdownAppliances');
    if (!dropdownAppliances) {
        dropdownAppliances = document.createElement('div');
        dropdownAppliances.className = 'dropdown-wrapper';
        dropdownAppliances.id = 'dropdownAppliances';

        const appliancesButton = document.createElement('button');
        appliancesButton.className = 'dropdown';
        appliancesButton.type = 'button';
        appliancesButton.id = 'dropdownAppliancesButton';
        appliancesButton.setAttribute('aria-haspopup', 'listbox');
        appliancesButton.setAttribute('aria-expanded', 'false');
        appliancesButton.setAttribute('aria-label', 'filtre appareils');

        const appliancesTextSpan = document.createElement('span');
        appliancesTextSpan.textContent = 'Appareils';
        appliancesButton.appendChild(appliancesTextSpan);

        const iconAppliances = document.createElement('i');
        iconAppliances.className = 'fa-solid fa-angle-down dropdown-icon';
        appliancesButton.appendChild(iconAppliances);

        dropdownAppliances.appendChild(appliancesButton);

        const appliancesContent = document.createElement('div');
        appliancesContent.className = 'dropdown-content';
        appliancesContent.setAttribute('role', 'listbox');
        appliancesContent.setAttribute('aria-labelledby', 'dropdownAppliancesButton');

        dropdownAppliances.appendChild(appliancesContent);
        filtersButtonsDiv.appendChild(dropdownAppliances);

        filtersButtonsDOM(appliancesButton, appliancesContent, iconAppliances, recipes, selectApplianceCallback, createAppliancesSearch);
    }

    // Créer le bouton pour les ustensiles
    let dropdownUstensils = document.querySelector('#dropdownUstensils');
    if (!dropdownUstensils) {
        dropdownUstensils = document.createElement('div');
        dropdownUstensils.className = 'dropdown-wrapper';
        dropdownUstensils.id = 'dropdownUstensils';

        const ustensilsButton = document.createElement('button');
        ustensilsButton.className = 'dropdown';
        ustensilsButton.type = 'button';
        ustensilsButton.id = 'dropdownUstensilsButton';
        ustensilsButton.setAttribute('aria-haspopup', 'listbox');
        ustensilsButton.setAttribute('aria-expanded', 'false');
        ustensilsButton.setAttribute('aria-label', 'filtre ustensiles');

        const ustensilsTextSpan = document.createElement('span');
        ustensilsTextSpan.textContent = 'Ustensiles';
        ustensilsButton.appendChild(ustensilsTextSpan);

        const iconUstensils = document.createElement('i');
        iconUstensils.className = 'fa-solid fa-angle-down dropdown-icon';
        ustensilsButton.appendChild(iconUstensils);

        dropdownUstensils.appendChild(ustensilsButton);

        const ustensilsContent = document.createElement('div');
        ustensilsContent.className = 'dropdown-content';
        ustensilsContent.setAttribute('role', 'listbox');
        ustensilsContent.setAttribute('aria-labelledby', 'dropdownUstensilsButton');

        dropdownUstensils.appendChild(ustensilsContent);
        filtersButtonsDiv.appendChild(dropdownUstensils);

        filtersButtonsDOM(ustensilsButton, ustensilsContent, iconUstensils, recipes, selectUstensilCallback, createUstensilsSearch);
    }
}

// Fonction pour gérer les événements sur les boutons de filtre
function filtersButtonsDOM(button, content, icon, recipes, selectCallback, createSearchFunction) {
    button.addEventListener('click', () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", !isExpanded);
        button.classList.toggle('show');

        if (icon) {
            icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        content.style.display = isExpanded ? 'none' : 'block';

        if (!isExpanded) {
            createSearchFunction(content, recipes, selectCallback);
        }
    });

    // Fonction pour réinitialiser l'état du bouton et l'icône lorsque l'on sélectionne un item
    content.addEventListener('click', (event) => {
        if (event.target.classList.contains('item')) {
            button.setAttribute("aria-expanded", "false");
            button.classList.remove('show');
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
            content.style.display = 'none';
        }
    });
}

// Fonction pour créer la zone de recherche des ingrédients
function createIngredientsSearch(content, recipes, selectCallback) {
    if (!content.querySelector('.search-filters')) {
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'sticky';
        searchContainer.style.top = '0';
        searchContainer.style.backgroundColor = 'white';
        searchContainer.style.zIndex = '1';
        searchContainer.style.padding = '10px 0 0 0';

        const searchInput = document.createElement('input');
        searchInput.classList.add('search-filters');
        searchInput.setAttribute('type', 'search');
        searchInput.setAttribute('id', 'ingredients');
        searchInput.setAttribute('name', 'ingredients');
        searchInput.setAttribute('aria-label', 'rechercher parmi les ingrédients');
        searchInput.setAttribute("tabindex", "0");

        const iconSearch = document.createElement('i');
        iconSearch.className = 'fa-solid fa-magnifying-glass filters-icon';
        iconSearch.setAttribute('aria-hidden', 'true');

        const clearIcon = document.createElement('i');
        clearIcon.className = 'fa-solid fa-xmark clear-icon';
        clearIcon.setAttribute('aria-label', 'croix pour supprimer la saisie');
        clearIcon.style.display = 'none';

        searchContainer.appendChild(iconSearch);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(clearIcon);
        content.appendChild(searchContainer);

        // Nettoyage des doublons en normalisant les ingrédients en minuscules
        const ingredientsList = [...new Set(
            recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient.toLowerCase()))
        )];

        const listContainer = document.createElement('div');
        listContainer.className = 'ingredients-list-container';
        content.appendChild(listContainer);

        function displayList(filteredItems) {
            listContainer.innerHTML = '';
            filteredItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.textContent = item;
                itemElement.setAttribute("tabindex", "0");
                itemElement.addEventListener('click', () => {
                    selectCallback(item);
                });
                listContainer.appendChild(itemElement);
            });
        }

        displayList(ingredientsList);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            clearIcon.style.display = query ? 'block' : 'none';
            const filteredItems = ingredientsList.filter(item =>
                item.toLowerCase().includes(query)
            );
            displayList(filteredItems);
        });

        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            displayList(ingredientsList);
        });
    }
}

// Fonction pour créer la zone de recherche des appareils
function createAppliancesSearch(content, recipes, selectCallback) {
    if (!content.querySelector('.search-filters')) {
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'sticky';
        searchContainer.style.top = '0';
        searchContainer.style.backgroundColor = 'white';
        searchContainer.style.zIndex = '1';
        searchContainer.style.padding = '10px 0 0 0';

        const searchInput = document.createElement('input');
        searchInput.classList.add('search-filters');
        searchInput.setAttribute('type', 'search');
        searchInput.setAttribute('id', 'appliances');
        searchInput.setAttribute('name', 'appliances');
        searchInput.setAttribute('aria-label', 'rechercher parmi les appareils');
        searchInput.setAttribute("tabindex", "0");

        const iconSearch = document.createElement('i');
        iconSearch.className = 'fa-solid fa-magnifying-glass filters-icon';
        iconSearch.setAttribute('aria-hidden', 'true');

        const clearIcon = document.createElement('i');
        clearIcon.className = 'fa-solid fa-xmark clear-icon';
        clearIcon.setAttribute('aria-label', 'croix pour supprimer la saisie');
        clearIcon.style.display = 'none';

        searchContainer.appendChild(iconSearch);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(clearIcon);
        content.appendChild(searchContainer);

        // Nettoyage des doublons en normalisant les appareils en minuscules
        const appliancesList = [...new Set(
            recipes.map(recipe => recipe.appliance.toLowerCase())
        )];

        const listContainer = document.createElement('div');
        listContainer.className = 'appliances-list-container';
        content.appendChild(listContainer);

        function displayList(filteredItems) {
            listContainer.innerHTML = '';
            filteredItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.textContent = item;
                itemElement.setAttribute("tabindex", "0");
                itemElement.addEventListener('click', () => {
                    selectCallback(item);
                });
                listContainer.appendChild(itemElement);
            });
        }

        displayList(appliancesList);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            clearIcon.style.display = query ? 'block' : 'none';
            const filteredItems = appliancesList.filter(item =>
                item.toLowerCase().includes(query)
            );
            displayList(filteredItems);
        });

        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            displayList(appliancesList);
        });
    }
}

// Fonction pour créer la zone de recherche des ustensiles
function createUstensilsSearch(content, recipes, selectCallback) {
    if (!content.querySelector('.search-filters')) {
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'sticky';
        searchContainer.style.top = '0';
        searchContainer.style.backgroundColor = 'white';
        searchContainer.style.zIndex = '1';
        searchContainer.style.padding = '10px 0 0 0';

        const searchInput = document.createElement('input');
        searchInput.classList.add('search-filters');
        searchInput.setAttribute('type', 'search');
        searchInput.setAttribute('id', 'ustensils');
        searchInput.setAttribute('name', 'ustensils');
        searchInput.setAttribute('aria-label', 'rechercher parmi les ustensiles');
        searchInput.setAttribute("tabindex", "0");

        const iconSearch = document.createElement('i');
        iconSearch.className = 'fa-solid fa-magnifying-glass filters-icon';
        iconSearch.setAttribute('aria-hidden', 'true');

        const clearIcon = document.createElement('i');
        clearIcon.className = 'fa-solid fa-xmark clear-icon';
        clearIcon.setAttribute('aria-label', 'croix pour supprimer la saisie');
        clearIcon.style.display = 'none';

        searchContainer.appendChild(iconSearch);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(clearIcon);
        content.appendChild(searchContainer);

        // Nettoyage des doublons en normalisant les ustensiles en minuscules
        const ustensilsList = [...new Set(
            recipes.flatMap(recipe => recipe.ustensils.map(ust => ust.toLowerCase()))
        )];

        const listContainer = document.createElement('div');
        listContainer.className = 'ustensils-list-container';
        content.appendChild(listContainer);

        function displayList(filteredItems) {
            listContainer.innerHTML = '';
            filteredItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.textContent = item;
                itemElement.setAttribute("tabindex", "0");
                itemElement.addEventListener('click', () => {
                    selectCallback(item);
                });
                listContainer.appendChild(itemElement);
            });
        }

        displayList(ustensilsList);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            clearIcon.style.display = query ? 'block' : 'none';
            const filteredItems = ustensilsList.filter(item =>
                item.toLowerCase().includes(query)
            );
            displayList(filteredItems);
        });

        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            displayList(ustensilsList);
        });
    }
}
