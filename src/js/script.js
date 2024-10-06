import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Klucz API Pixabay
const API_KEY = '46331793-9cec4180ce0cddf1fbb8fc669';
const BASE_URL = 'https://pixabay.com/api/';

// DOM elements
const form = document.querySelector('#search-form');
const gallery = document.querySelector('#gallery');
const loader = document.querySelector('#loader');
const loadMoreBtn = document.querySelector('#load-more'); // Przycisk Load more

let lightbox;
let currentPage = 1;
let searchQuery = '';
let totalHits = 0;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', fetchImages);

async function onSearch(event) {
  event.preventDefault();
  searchQuery = event.target.querySelector('#search-input').value.trim();

  if (searchQuery === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term!',
    });
    return;
  }

  clearGallery();
  currentPage = 1;
  toggleLoader();
  loadMoreBtn.classList.add('hidden'); // Ukryj przycisk na początku wyszukiwania

  try {
    const data = await fetchImages();
    if (data.hits.length === 0) {
      iziToast.warning({
        title: 'No results',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
    } else {
      renderGallery(data.hits);
      lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
      totalHits = data.totalHits;
      checkEndOfResults();
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
    });
  } finally {
    toggleLoader();
  }
}

// Funkcja pobierająca obrazy z API
async function fetchImages() {
  try {
    const { data } = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`);
    renderGallery(data.hits);
    lightbox.refresh(); // Odświeżenie instancji SimpleLightbox
    currentPage += 1; // Zwiększ numer strony
    checkEndOfResults();
    smoothScroll();
    return data;
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
    });
  }
}

// Funkcja sprawdzająca, czy dotarliśmy do końca wyników
function checkEndOfResults() {
  if (gallery.querySelectorAll('.gallery__item').length >= totalHits) {
    loadMoreBtn.classList.add('hidden'); // Ukryj przycisk, gdy osiągnięto koniec wyników
    iziToast.info({
      title: 'End of results',
      message: "We're sorry, but you've reached the end of search results.",
    });
  } else {
    loadMoreBtn.classList.remove('hidden'); // Pokaż przycisk, jeśli są więcej wyniki
  }
}

// Renderowanie galerii
function renderGallery(images) {
  const markup = images.map(image => `
    <a href="${image.largeImageURL}" class="gallery__item">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      <div class="info">
        <p><b>Likes:</b> ${image.likes}</p>
        <p><b>Views:</b> ${image.views}</p>
        <p><b>Comments:</b> ${image.comments}</p>
        <p><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </a>
  `).join('');
  gallery.insertAdjacentHTML('beforeend', markup); // Dodaj obrazy do galerii
}

// Czyszczenie galerii
function clearGallery() {
  gallery.innerHTML = '';
}

// Funkcja zmieniająca widoczność wskaźnika ładowania
function toggleLoader() {
  loader.classList.toggle('hidden');
}

// Płynne przewijanie
function smoothScroll() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
