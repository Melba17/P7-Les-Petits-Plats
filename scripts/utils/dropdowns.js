// Fonction utilitaire pour créer un élément avec ses attributs et enfants
function createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    children.forEach(child => element.appendChild(child));
    return element;
}

// Fonction pour créer une zone de recherche générique
function createSearchArea(content, items, selectCallback) {
    if (!content.querySelector('.search-filters')) {
        const searchContainer = createElement('div', {
            style: 'position: sticky; top: 0; background-color: white; z-index: 1; padding: 10px 0 0 0;'
        });

        const searchInput = createElement('input', {
            type: 'search',
            class: 'search-filters',
            id: `${items[0].type}`,
            name: `${items[0].type}`,
            'aria-label': `rechercher parmi les ${items[0].type}`,
            tabindex: '0'
        });

        const iconSearch = createElement('i', {
            class: 'fa-solid fa-magnifying-glass filters-icon',
            'aria-hidden': 'true'
        });

        const clearIcon = createElement('i', {
            class: 'fa-solid fa-xmark clear-icon',
            'aria-label': 'croix pour supprimer la saisie',
            style: 'display: none;'
        });

        searchContainer.append(iconSearch, searchInput, clearIcon);
        content.appendChild(searchContainer);

        const listContainer = createElement('div', { class: `${items[0].type}-list-container` });
        content.appendChild(listContainer);

        function displayList(filteredItems) {
            listContainer.innerHTML = '';
            filteredItems.forEach(item => {
                const itemElement = createElement('div', {
                    class: 'item',
                    tabindex: '0'
                }, [document.createTextNode(item)]);
                itemElement.addEventListener('click', () => selectCallback(item));
                listContainer.appendChild(itemElement);
            });
        }

        const uniqueItems = [...new Set(items.map(item => item.toLowerCase()))];
        displayList(uniqueItems);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            clearIcon.style.display = query ? 'block' : 'none';
            const filteredItems = uniqueItems.filter(item => item.includes(query));
            displayList(filteredItems);
        });

        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            displayList(uniqueItems);
        });
    }
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
            'aria-label': `filtre ${label.toLowerCase()}`
        }, [
            createElement('span', {}, [document.createTextNode(label)]),
            createElement('i', { class: 'fa-solid fa-angle-down dropdown-icon' })
        ]);

        const content = createElement('div', {
            class: 'dropdown-content',
            role: 'listbox',
            'aria-labelledby': `${id}Button`
        });

        dropdownWrapper.append(button, content);
        document.querySelector('.dropdowns').appendChild(dropdownWrapper);

        filtersButtonsDOM(button, content, button.querySelector('.dropdown-icon'), recipes, selectCallback, createSearchFunction);
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
