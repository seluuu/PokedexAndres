

import * as pokeApi from "./pokeApi/api.js";

const state = { pokemon: [], currentId: 25, filter: "all", numericBuffer: "" };
const $ = (selector) => document.querySelector(selector);
const typeNames = { grass: "PLANTA", fire: "FUEGO", water: "AGUA", electric: "ELÉC", psychic: "PSI", poison: "VENENO", flying: "VOLADOR", bug: "BICHO", normal: "NORMAL", fighting: "LUCHA", ghost: "FANTASMA", ice: "HIELO", dragon: "DRAGÓN", ground: "TIERRA", rock: "ROCA" };

function formatId(id) { return `#${String(id).padStart(3, "0")}`; }
function current() { return state.pokemon.find((pokemon) => pokemon.id === state.currentId) || state.pokemon[0]; }
function titleCase(value) { return value.charAt(0).toUpperCase() + value.slice(1); }

function drawStats(pokemon) {
    [["hp", pokemon.stats[0].base_stat], ["atk", pokemon.stats[1].base_stat], ["def", pokemon.stats[2].base_stat], ["spd", pokemon.stats[5].base_stat]].forEach(([key, value]) => {
        const bar = $(`#stat-${key}`);
        bar.innerHTML = Array.from({ length: 12 }, (_, index) => `<b class="${index >= Math.ceil(value / 15) ? "off" : ""}"></b>`).join("");
        $(`#value-${key}`).textContent = value;
    });
}

function drawPokemon(pokemon) {
    if (!pokemon) return;
    state.currentId = pokemon.id;
    $("#screen-id").textContent = `ID: ${formatId(pokemon.id)}`;
    $("#screen-name").textContent = pokemon.name.toUpperCase();
    $("#data-id").textContent = formatId(pokemon.id);
    $("#data-name").textContent = pokemon.name.toUpperCase();
    $("#species").textContent = `${titleCase(pokemon.species.name)}`;
    $("#height").textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    $("#weight").textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
    $("#flavor").textContent = `"${pokemon.flavor}"`;
    $("#pokemon-art").classList.add("loading");
    $("#pokemon-art").onload = () => $("#pokemon-art").classList.remove("loading");
    $("#pokemon-art").src = pokemon.artwork;
    $("#type-badges").innerHTML = pokemon.types.map(({ type }) => `<span class="type-${type.name}">${typeNames[type.name] || type.name.toUpperCase()}</span>`).join("");
    drawStats(pokemon);
    const index = state.pokemon.findIndex((item) => item.id === pokemon.id);
    const prev = state.pokemon[(index - 1 + state.pokemon.length) % state.pokemon.length];
    const next = state.pokemon[(index + 1) % state.pokemon.length];
    $("#prev-pokemon span").textContent = `${formatId(prev.id)} ${prev.name.toUpperCase()}`;
    $("#next-pokemon span").textContent = `${formatId(next.id)} ${next.name.toUpperCase()}`;
    document.querySelectorAll(".roster-item").forEach((item) => item.classList.toggle("selected", Number(item.dataset.id) === pokemon.id));
}

function renderRoster() {
    const filtered = state.pokemon.filter((pokemon) => state.filter === "all" || pokemon.types.some(({ type }) => type.name === state.filter));
    $("#catalog-count").textContent = `${filtered.length} ESPECÍMENES`;
    $("#roster").innerHTML = filtered.map((pokemon) => `<button class="roster-item ${pokemon.id === state.currentId ? "selected" : ""}" data-id="${pokemon.id}"><img src="${pokemon.sprite}" alt=""><strong>${formatId(pokemon.id)}</strong><span>${pokemon.name.toUpperCase()}</span></button>`).join("");
    document.querySelectorAll(".roster-item").forEach((item) => item.addEventListener("click", () => drawPokemon(state.pokemon.find((pokemon) => pokemon.id === Number(item.dataset.id)))));
}

function selectById(id) { const pokemon = state.pokemon.find((item) => item.id === id); if (pokemon) drawPokemon(pokemon); }
function showSearchResults(value) {
    const query = value.trim().toLowerCase();
    const results = state.pokemon.filter((pokemon) => pokemon.name.includes(query) || String(pokemon.id).includes(query)).slice(0, 8);
    $("#search-results").innerHTML = results.map((pokemon) => `<div class="search-result" data-id="${pokemon.id}"><b>${formatId(pokemon.id)} ${pokemon.name.toUpperCase()}</b><span>${pokemon.types.map(({ type }) => type.name).join("/")}</span></div>`).join("");
    $("#search-results").classList.toggle("open", Boolean(query));
    document.querySelectorAll(".search-result").forEach((item) => item.addEventListener("click", () => { selectById(Number(item.dataset.id)); $("#pokemon-search").value = ""; $("#search-results").classList.remove("open"); }));
}

async function init() {
    $("#catalog-count").textContent = "CARGANDO...";
    try {
        state.pokemon = await pokeApi.getKantoPokemons();
        renderRoster();
        drawPokemon(current());
    } catch (error) { $("#catalog-count").textContent = "ERROR DE CONEXIÓN"; $("#flavor").textContent = "No se pudo establecer comunicación con PokeAPI."; console.error(error); }
}

$("#pokemon-search").addEventListener("input", (event) => showSearchResults(event.target.value));
$("#clear-search").addEventListener("click", () => { $("#pokemon-search").value = ""; $("#search-results").classList.remove("open"); selectById(25); });
$("#prev-pokemon").addEventListener("click", () => selectById(state.pokemon[(state.pokemon.findIndex((pokemon) => pokemon.id === state.currentId) - 1 + 151) % 151].id));
$("#next-pokemon").addEventListener("click", () => selectById(state.pokemon[(state.pokemon.findIndex((pokemon) => pokemon.id === state.currentId) + 1) % 151].id));
$("#dpad-left").addEventListener("click", () => selectById(Math.max(1, state.currentId - 1)));
$("#dpad-right").addEventListener("click", () => selectById(Math.min(151, state.currentId + 1)));
$("#dpad-up").addEventListener("click", () => selectById(Math.max(1, state.currentId - 10)));
$("#dpad-down").addEventListener("click", () => selectById(Math.min(151, state.currentId + 10)));
$("#info-button").addEventListener("click", () => selectById((state.currentId + 5) % 151 || 151));
document.querySelectorAll(".type-filter").forEach((button) => button.addEventListener("click", () => { state.filter = button.dataset.type; document.querySelectorAll(".type-filter").forEach((item) => item.classList.toggle("active", item === button)); renderRoster(); }));
document.querySelectorAll(".keys button").forEach((button) => button.addEventListener("click", () => { state.numericBuffer = (state.numericBuffer + button.dataset.number).slice(0, 3); $("#pokemon-search").value = state.numericBuffer; showSearchResults(state.numericBuffer); }));
$("#key-clear").addEventListener("click", () => { state.numericBuffer = ""; $("#pokemon-search").value = ""; $("#search-results").classList.remove("open"); });
$("#key-enter").addEventListener("click", () => { selectById(Number(state.numericBuffer)); state.numericBuffer = ""; $("#pokemon-search").value = ""; $("#search-results").classList.remove("open"); });
$("#voice").addEventListener("click", () => { const pokemon = current(); if (!pokemon || !window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(`${pokemon.name}. Número ${pokemon.id}. ${pokemon.species.name}. ${pokemon.flavor}`); utterance.lang = "es-ES"; $("#voice").classList.add("speaking"); utterance.onend = () => $("#voice").classList.remove("speaking"); window.speechSynthesis.speak(utterance); });

init();
