let getAllPokemons = async () => {
    let pokemonData = await fetch("https://pokeapi.co/api/v2/pokemon");

    pokemonData = await pokemonData.json();

    return pokemonData;
}

let getPokemonById = async (id) => {
    /* return pokemon */

    let pokemonData = await fetch("https://pokeapi.co/api/v2/pokemon/" + id);

    pokemonData = await pokemonData.json();

    return pokemonData;
}

let getKantoPokemons = async () => {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const list = await response.json();
    return Promise.all(list.results.map(async (entry, index) => {
        const pokemon = await getPokemonById(index + 1);
        const speciesResponse = await fetch(pokemon.species.url);
        const species = await speciesResponse.json();
        const flavor = species.flavor_text_entries.find((entry) => entry.language.name === "es") || species.flavor_text_entries.find((entry) => entry.language.name === "en");
        return { ...pokemon, flavor: flavor?.flavor_text.replace(/[\n\f]/g, " ") || "Registro sin descripción.", artwork: pokemon.sprites.other["official-artwork"].front_default, sprite: pokemon.sprites.front_default };
    }));
};


let getPokemonsAbility = async (abilityName) => {
    let pokemonData = await fetch ("https://pokeapi.co/api/v2/ability/" + abilityName);

    pokemonData = await pokemonData.json();

    return pokemonData;
};

let getPokemonType = async (abilityName) => {
    let pokemonData = await fetch ("https://pokeapi.co/api/v2/type/" + abilityName);

    pokemonData = await pokemonData.json();

    return pokemonData;
};

export {getAllPokemons, getPokemonById, getKantoPokemons, getPokemonsAbility, getPokemonType}