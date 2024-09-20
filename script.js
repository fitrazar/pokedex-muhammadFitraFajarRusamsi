const apiBaseUrl = 'https://pokeapi.co/api/v2/pokemon';
let currentPage = 1;
let limit = 20;
let totalPokemons = 0;
let selectedType = '';
let searchQuery = '';
let isSearchActive = false;
let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemon();
    fetchPokemonTypes();
});

async function fetchPokemon() {
    const offset = (currentPage - 1) * limit;
    let url = `${apiBaseUrl}?offset=${offset}&limit=${limit}`;

    if (selectedType) {
        await filterAndSearch();
        return;
    }

    if (isSearchActive && searchQuery) {
        await performSearch(searchQuery);
        return;
    }

    const response = await fetch(url);
    const data = await response.json();
    totalPokemons = data.count;

    displayPokemonList(data.results);
    updatePagination();
}

async function fetchPokemonTypes() {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();

    data.results.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        typeSelect.appendChild(option);
    });
}

function displayPokemonList(pokemonList) {
    pokemonListContainer.innerHTML = '';

    pokemonList.forEach(pokemon => {
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('card', 'bg-base-100', 'shadow-xl', 'p-4');

        pokemonItem.innerHTML = `
            <figure>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.url.split('/')[6]}.png" alt="${pokemon.name}" class="w-24 h-24 mx-auto">
            </figure>
            <div class="card-body text-center">
                <h2 class="card-title capitalize">${pokemon.name}</h2>
                <button class="btn btn-primary mt-4" onclick="showPokemonDetails('${pokemon.url}')">Detail</button>
            </div>
        `;

        pokemonListContainer.appendChild(pokemonItem);
    });
}

async function showPokemonDetails(url) {
    const response = await fetch(url);
    const pokemon = await response.json();
    console.log(pokemon)

    modalTitle.textContent = pokemon.name;
    modalImage.src = pokemon.sprites.other['official-artwork'].front_default;
    modalHeight.textContent = pokemon.height;
    modalWeight.textContent = pokemon.weight;
    modalAbilities.textContent = pokemon.abilities.map(ability => ability.ability.name).join(', ');

    pokemonModal.checked = true;
}

function updatePagination() {
    const totalPages = Math.ceil(totalPokemons / limit);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;

    pagination.innerHTML = '';

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage + 1 < 4) {
        if (startPage === 1) {
            endPage = Math.min(4, totalPages);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - 3);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('btn', 'btn-outline', 'mx-1');
        if (i === currentPage) {
            pageButton.classList.add('btn-primary');
        }
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            if (selectedType) {
                filterByType();
            } else {
                fetchPokemon();
            }
        };
        pagination.appendChild(pageButton);
    }
}

function prevPageFnc() {
    if (currentPage > 1) {
        currentPage--;
        fetchPokemon();
    }
}

function nextPageFnc() {
    const totalPages = Math.ceil(totalPokemons / limit);
    if (currentPage < totalPages) {
        currentPage++;
        fetchPokemon();
    }
}

function searchPokemon() {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim().toLowerCase();
        if (!searchQuery) {
            isSearchActive = false;
            currentPage = 1;
            fetchPokemon();
            return;
        }

        isSearchActive = true;
        currentPage = 1;
        fetchPokemon();
    }, 300);
}

async function performSearch(query) {
    const offset = (currentPage - 1) * limit;

    const response = await fetch(`${apiBaseUrl}?limit=1118`);
    const data = await response.json();

    const filteredPokemonList = data.results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(query)
    );

    totalPokemons = filteredPokemonList.length;

    const paginatedResults = filteredPokemonList.slice(offset, offset + limit);
    displayPokemonList(paginatedResults);
    updatePagination();
}

async function filterByType() {
    selectedType = typeSelect.value;
    currentPage = 1;
    fetchPokemon();
}


async function filterAndSearch() {
    selectedType = typeSelect.value;
    const offset = (currentPage - 1) * limit;

    const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
    const data = await response.json();

    let filteredPokemonList = data.pokemon.map(p => p.pokemon);

    if (isSearchActive && searchQuery) {
        filteredPokemonList = filteredPokemonList.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchQuery)
        );
    }

    totalPokemons = filteredPokemonList.length;

    const paginatedResults = filteredPokemonList.slice(offset, offset + limit);
    displayPokemonList(paginatedResults);
    updatePagination();
}