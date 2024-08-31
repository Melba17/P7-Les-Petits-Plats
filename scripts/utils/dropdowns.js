// Fonction utilitaire pour créer un élément avec ses attributs et enfants
function createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    children.forEach(child => element.appendChild(child));
    return element;
}

function createSearchArea(content, items, selectCallback) {
    // Crée un conteneur pour la recherche
    const searchContainer = createElement('div', {
        style: 'position: sticky; top: 0; background-color: white; z-index: 1; padding: 10px;'
    });

    // Crée un ID unique pour le champ de recherche
    const uniqueId = `search-${Date.now()}`;

    // Crée le champ de recherche
    const searchInput = createElement('input', {
        type: 'search',
        class: 'search-filters',
        id: uniqueId,
        name: uniqueId,
        'aria-label': `Rechercher parmi les éléments`,
        tabindex: '0'
    });

    // Crée l'icône de recherche
    const iconSearch = createElement('i', {
        class: 'fa-solid fa-magnifying-glass filters-icon',
        'aria-hidden': 'true'
    });

    // Crée l'icône de suppression pour vider le champ de recherche
    const clearIcon = createElement('i', {
        class: 'fa-solid fa-xmark clear-icon',
        'aria-label': 'Supprimer la saisie',
        style: 'display: none; cursor: pointer;'
    });

    // Ajoute les éléments au conteneur de recherche
    searchContainer.append(iconSearch, searchInput, clearIcon);
    content.insertBefore(searchContainer, content.querySelector('.list-container'));

    // Vide le conteneur de liste avant d'ajouter les nouveaux éléments
    const listContainer = content.querySelector('.list-container');
    if (listContainer) {
        listContainer.innerHTML = ''; // Vide la liste avant d'ajouter de nouveaux éléments
    }

    // Fonction pour afficher la liste des éléments
    function displayList(filteredItems) {
        if (listContainer) {
            listContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter les nouveaux éléments
            if (filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const itemElement = createElement('div', {
                        class: 'item',
                        tabindex: '0'
                    }, [document.createTextNode(item)]);
                    itemElement.addEventListener('click', () => selectCallback(item));
                    listContainer.appendChild(itemElement);
                });
            } else {
                listContainer.innerHTML = '<div class="item">Aucun résultat trouvé</div>'; // Message pour aucun résultat
            }
        }
    }

    // Crée une liste unique des items pour éviter les doublons
    const uniqueItems = [...new Set(items.map(item => item.toLowerCase()))];
    displayList(uniqueItems); // Affiche la liste initiale

    // Écoute les entrées de recherche pour filtrer les éléments
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        clearIcon.style.display = query ? 'block' : 'none'; // Affiche ou cache l'icône de suppression

        // Filtre les éléments en fonction de la saisie
        const filteredItems = uniqueItems.filter(item => item.includes(query));

        // Affiche les éléments filtrés
        displayList(filteredItems);
    });

    // Écoute le clic sur l'icône de suppression pour vider le champ de recherche
    clearIcon.addEventListener('click', () => {
        searchInput.value = ''; // Vide le champ de recherche
        clearIcon.style.display = 'none'; // Cache l'icône de suppression
        displayList(uniqueItems); // Affiche la liste complète
    });
}




// Fonction pour créer un menu déroulant générique
function createDropdown(id, label, recipes, selectCallback, createSearchFunction) {
    let dropdownWrapper = document.querySelector(`#${id}`);
    if (!dropdownWrapper) {
        dropdownWrapper = createElement('div', {
            class: 'dropdown-wrapper',
            id: id
        });

        const button = createElement('button', {
            class: 'dropdown',
            type: 'button',
            id: `${id}Button`,
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-label': `Filtre ${label.toLowerCase()}`
        }, [
            createElement('span', {}, [document.createTextNode(label)]),
            createElement('i', { class: 'fa-solid fa-angle-down dropdown-icon' })
        ]);

        const content = createElement('div', {
            class: 'dropdown-content',
            role: 'listbox',
            'aria-labelledby': `${id}Button`,
            style: 'display: none; max-height: 300px; overflow-y: auto;' 
        });

        dropdownWrapper.append(button, content);
        document.querySelector('.dropdowns').appendChild(dropdownWrapper);
        
        // Ajoute un conteneur pour la liste des éléments
        const listContainer = createElement('div', { class: 'list-container' });
        content.appendChild(listContainer);

        filtersButtonsDOM(button, content, button.querySelector('.dropdown-icon'), recipes, selectCallback, createSearchFunction);
    } else {
        // Mise à jour du conteneur de liste existant
        const content = dropdownWrapper.querySelector('.dropdown-content');
        const listContainer = content.querySelector('.list-container');
        if (listContainer) {
            // Assurez-vous que la fonction de recherche est correctement mise à jour
            createSearchFunction(listContainer, recipes, selectCallback);
        }
    }
}



// Fonction pour créer les boutons de filtre
export function createFiltersButtons(recipes, selectIngredientCallback, selectApplianceCallback, selectUstensilCallback) {
    if (!document.querySelector('.dropdowns')) {
        console.error("La div .dropdowns n'existe pas dans le DOM.");
        return;
    }

    createDropdown('dropdownIngredients', 'Ingrédients', recipes, selectIngredientCallback, (content, recipes, selectCallback) => {
        createSearchArea(content, recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)), selectCallback);
    });

    createDropdown('dropdownAppliances', 'Appareils', recipes, selectApplianceCallback, (content, recipes, selectCallback) => {
        createSearchArea(content, recipes.map(recipe => recipe.appliance), selectCallback);
    });

    createDropdown('dropdownUstensils', 'Ustensiles', recipes, selectUstensilCallback, (content, recipes, selectCallback) => {
        createSearchArea(content, recipes.flatMap(recipe => recipe.ustensils), selectCallback);
    });
}

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
