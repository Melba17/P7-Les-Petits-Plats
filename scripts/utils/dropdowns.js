/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  dropdowns.js : AFFICHAGE ET COMPORTEMENT DES MENUS DÉROULANTS POUR LES FILTRES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////// */


/* //////////////////////////////////////////
   CRÉATION DES BOUTONS DE FILTRE
////////////////////////////////////////// */
export function createFiltersButtons(recipes, selectIngredientCallback, selectApplianceCallback, selectUstensilCallback) {
    if (!document.querySelector('.dropdowns')) {
        console.error("La div .dropdowns n'existe pas dans le DOM.");
        return;
    }

    createDropdown('dropdownIngredients', 'Ingrédients', recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)), selectIngredientCallback, createSearchArea);
    createDropdown('dropdownAppliances', 'Appareils', recipes.map(recipe => recipe.appliance), selectApplianceCallback, createSearchArea);
    createDropdown('dropdownUstensils', 'Ustensiles', recipes.flatMap(recipe => recipe.ustensils), selectUstensilCallback, createSearchArea);
}

/* //////////////////////////////////////////
   CRÉATION D'UN MENU DÉROULANT
////////////////////////////////////////// */
function createDropdown(id, label, items, selectCallback, createSearchFunction) {
    let dropdownWrapper = document.querySelector(`#${id}`);
    
    if (!dropdownWrapper) {
        dropdownWrapper = createElement('div', { class: 'dropdown-wrapper', id: id });
        
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
            'aria-labelledby': `${id}Button`
        });
        
        dropdownWrapper.append(button, content);
        document.querySelector('.dropdowns').appendChild(dropdownWrapper);
        
        const listContainer = createElement('div', { class: 'list-container' });
        content.appendChild(listContainer);
        
        if (createSearchFunction) {
            createSearchFunction(listContainer, items, selectCallback);
        }

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            toggleDropdownIcon(button, isExpanded);
        });

        // Ajouter gestion des événements clavier
        listContainer.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const focusedItem = document.activeElement;
                if (focusedItem.classList.contains('item')) {
                    selectCallback(focusedItem.textContent);
                }
            }
        });

    } else {
        const content = dropdownWrapper.querySelector('.dropdown-content');
        const listContainer = content.querySelector('.list-container');
        if (createSearchFunction) {
            createSearchFunction(listContainer, items, selectCallback);
        }
    }

    // Met à jour l'icône lorsqu'on sélectionne un élément
    const listContainer = dropdownWrapper.querySelector('.list-container');
    listContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('item')) {
            const button = dropdownWrapper.querySelector('.dropdown');
            toggleDropdownIcon(button, true); // Passer true pour fermer le menu
        }
    });
}


/* //////////////////////////////////////////
   GESTION DE L'ICÔNE DU MENU DÉROULANT
////////////////////////////////////////// */
function toggleDropdownIcon(button, isExpanded) {
    button.setAttribute('aria-expanded', !isExpanded);
    const icon = button.querySelector('.dropdown-icon');
    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    const content = button.nextElementSibling;
    content.style.display = isExpanded ? 'none' : 'block';
}

/* //////////////////////////////////////////
   CRÉATION DE LA ZONE DE RECHERCHE
////////////////////////////////////////// */
// Création de la zone de recherche
function createSearchArea(listContainer, items, selectCallback) {
    const searchContainer = createElement('div', {
        style: 'position: sticky; top: 0; background-color: white; z-index: 1; padding: 10px;'
    });

    const uniqueId = generateUniqueId('search');
    const searchInput = createElement('input', {
        type: 'search',
        class: 'search-filters',
        id: uniqueId,
        name: uniqueId,
        'aria-label': 'Rechercher parmi les éléments',
        tabindex: '0'
    });

    const iconSearch = createElement('i', {
        class: 'fa-solid fa-magnifying-glass filters-icon',
        'aria-hidden': 'true'
    });

    const clearIcon = createElement('i', {
        class: 'fa-solid fa-xmark clear-icon',
        'aria-label': 'Supprimer la saisie',
        tabindex: '0' // Rendre la croix focusable
    });

    searchContainer.append(iconSearch, searchInput, clearIcon);
    listContainer.parentNode.insertBefore(searchContainer, listContainer);

    const uniqueItems = [...new Set(items.map(item => item.toLowerCase()))];
    displayList(listContainer, uniqueItems, selectCallback);

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        clearIcon.style.display = query ? 'block' : 'none';
        const filteredItems = uniqueItems.filter(item => item.includes(query));
        displayList(listContainer, filteredItems, selectCallback);
    });

    clearIcon.addEventListener('click', () => {
        searchInput.value = '';
        clearIcon.style.display = 'none';
        searchInput.focus(); // Re-focus sur le champ de recherche après la suppression
        displayList(listContainer, uniqueItems, selectCallback);
    });

    // Gestion des événements clavier pour la croix
    clearIcon.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); // Empêche l'action par défaut de l'événement
            searchInput.value = ''; // Efface le texte de la recherche
            clearIcon.style.display = 'none'; // Masque la croix
            displayList(listContainer, uniqueItems, selectCallback); // Réaffiche la liste complète
            searchInput.focus(); // Re-focus sur le champ de recherche
        }
    });
}


/* //////////////////////////////////////////
   AFFICHAGE DE LA LISTE DES ÉLÉMENTS
////////////////////////////////////////// */
function displayList(listContainer, items, selectCallback) {
    listContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter les nouveaux éléments

    if (items.length > 0) {
        items.forEach(item => {
            const itemElement = createElement('div', { class: 'item', tabindex: '0' }, [document.createTextNode(item)]);
            itemElement.addEventListener('click', () => selectCallback(item));
            listContainer.appendChild(itemElement);
        });
    } else {
        const noResults = createElement('div', { class: 'item' }, [document.createTextNode('Aucun résultat trouvé')]);
        listContainer.appendChild(noResults);
    }
}

/* //////////////////////////////////////////////////////////////////////////
   FONCTION UTILE POUR CRÉER DES ÉLÉMENTS AVEC DES ATTRIBUTS ET DES ENFANTS /
   CENTRALISATION DE LA LOGIQUE DE CREATION DES ELEMENTS HTML/DOM 
///////////////////////////////////////////////////////////////////////// */
function createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    children.forEach(child => element.appendChild(child));
    return element;
}

/* ////////////////////////////////////////////////////////////////////////////////////
   GÉNÉRATEUR D'ID UNIQUE POUR CHAQUE BARRE DE RECHERCHE DANS LES MENUS DEROULANTS
//////////////////////////////////////////////////////////////////////////////////// */
let idCounter = 0;
function generateUniqueId(prefix = '') {
    idCounter += 1;
    return `${prefix}-${idCounter}`; // retourne search-1, search-2, search-3 
}
