// Générateur d'ID unique
let idCounter = 0;
function generateUniqueId(prefix = '') {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
}

// Fonction utilitaire pour créer un élément avec ses attributs et enfants
function createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    children.forEach(child => element.appendChild(child));
    return element;
}

// Fonction pour créer une zone de recherche avec des ID uniques
export function createSearchArea(listContainer, items, selectCallback) {
    // Crée un conteneur pour la recherche
    const searchContainer = createElement('div', {
        style: 'position: sticky; top: 0; background-color: white; z-index: 1; padding: 10px;'
    });

    // Crée un ID unique pour le champ de recherche
    const uniqueId = generateUniqueId('search');

    // Crée le champ de recherche
    const searchInput = createElement('input', {
        type: 'search',
        class: 'search-filters',
        id: uniqueId, // Utilisation d'un ID unique
        name: uniqueId, // Utilisation d'un ID unique
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
        'aria-label': 'Supprimer la saisie'
    });

    // Ajoute les éléments au conteneur de recherche
    searchContainer.append(iconSearch, searchInput, clearIcon);

    // Insère le conteneur de recherche avant le conteneur de liste
    listContainer.parentNode.insertBefore(searchContainer, listContainer);

    // Vide le conteneur de liste avant d'ajouter les nouveaux éléments
    listContainer.innerHTML = '';

    // Fonction pour afficher la liste des éléments
    function displayList(filteredItems) {
        listContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter les nouveaux éléments

        // Si des éléments sont trouvés, ils sont ajoutés à la liste avec un gestionnaire d'événements
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

    // Les éléments sont convertis en minuscules et les doublons sont supprimés en utilisant un Set
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
        displayList(uniqueItems); // La liste complète des éléments est affichée de nouveau
    });
}







// Fonction pour créer un menu déroulant générique dans l'interface utilisateur. Ce menu déroulant peut contenir une liste d'éléments que l'utilisateur peut sélectionner. 
function createDropdown(id, label, recipes, selectCallback, createSearchFunction) {
    // Essaie de trouver un élément existant avec l'ID spécifié
    let dropdownWrapper = document.querySelector(`#${id}`);
    
    if (!dropdownWrapper) {
        // Un nouvel élément div est créé avec la classe dropdown-wrapper et l'ID fourni
        dropdownWrapper = createElement('div', {
            class: 'dropdown-wrapper',
            id: id
        });
        
        // Un bouton est créé pour déclencher l'ouverture du menu déroulant
        const button = createElement('button', {
            class: 'dropdown',
            type: 'button',
            id: `${id}Button`, // ID unique pour le bouton
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-label': `Filtre ${label.toLowerCase()}`
        }, [
            createElement('span', {}, [document.createTextNode(label)]),
            createElement('i', { class: 'fa-solid fa-angle-down dropdown-icon' })
        ]);
        
        // Un élément div est créé pour contenir le contenu du menu déroulant
        const content = createElement('div', {
            class: 'dropdown-content',
            role: 'listbox',
            'aria-labelledby': `${id}Button` 
        });
        
        // Le bouton et le conteneur de contenu sont ajoutés au dropdownWrapper
        dropdownWrapper.append(button, content);
        document.querySelector('.dropdowns').appendChild(dropdownWrapper);
        
        // Un conteneur div supplémentaire est créé à l'intérieur de dropdown-content pour contenir les éléments de la liste
        const listContainer = createElement('div', { class: 'list-container' });
        content.appendChild(listContainer);
        
        // Configure les filtres et la recherche
        if (createSearchFunction) {
            createSearchFunction(listContainer, recipes, selectCallback);
        }

        // Ajoute l'événement pour ouvrir/fermer le menu déroulant
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            content.style.display = isExpanded ? 'none' : 'block';
        });

    } else {
        // Mise à jour du conteneur de liste existant
        const content = dropdownWrapper.querySelector('.dropdown-content');
        const listContainer = content.querySelector('.list-container');
        
        // Réinitialiser ou mettre à jour la liste des éléments affichés
        if (createSearchFunction) {
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

    createDropdown('dropdownIngredients', 'Ingrédients', recipes, selectIngredientCallback, (listContainer, recipes, selectCallback) => {
        createSearchArea(listContainer, recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient)), selectCallback);
    });

    createDropdown('dropdownAppliances', 'Appareils', recipes, selectApplianceCallback, (listContainer, recipes, selectCallback) => {
        createSearchArea(listContainer, recipes.map(recipe => recipe.appliance), selectCallback);
    });

    createDropdown('dropdownUstensils', 'Ustensiles', recipes, selectUstensilCallback, (listContainer, recipes, selectCallback) => {
        createSearchArea(listContainer, recipes.flatMap(recipe => recipe.ustensils), selectCallback);
    });
}

