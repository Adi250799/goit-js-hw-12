import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '46331793-9cec4180ce0cddf1fbb8fc669';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('#gallery');
const loader = document.querySelector('#loader');
const loadMoreBtn = document.querySelector('#load-more');
let lightbox;
let query = '';
let page = 1;
const perPage = 40;
let totalHits = 0;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(event) {
  event.preventDefault();
  query = event.target.querySelector('#search-input').value.trim();

  if (query === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term!',
    });
    return;
  }

  clearGallery();
  toggleLoader(true);
  loadMoreBtn.classList.add('hidden');
  page = 1;  // Reset paginacji

  try {
    const { data } = await fetchImages();
    totalHits = data.totalHits;
    if (data.hits.length === 0) {
      iziToast.warning({
        title: 'No results',
        message: 'No images found. Try a different search query!',
      });
    } else {
      renderGallery(data.hits);
      lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
      lightbox.refresh();
      if (data.totalHits > perPage) {
        loadMoreBtn.classList.remove('hidden');
      }
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
    });
  } finally {
    toggleLoader(false);
  }
}

async function onLoadMore() {
  page += 1;
  toggleLoader(true);
  try {
    const { data } = await fetchImages();
    renderGallery(data.hits, true);
    lightbox.refresh();

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (page * perPage >= totalHits) {
      loadMoreBtn.classList.add('hidden');
      iziToast.info({
        title: 'End',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images. Please try again later.',
    });
  } finally {
    toggleLoader(false);
  }
}

async function fetchImages() {
  const response = await axios.get(`${BASE_URL}`, {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: perPage,
    },
  });
  return response;
}

function renderGallery(images, append = false) {
  const markup = images
    .map(
      image => `
      <a href="${image.largeImageURL}" class="gallery__item">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        <div class="info">
          <p><b>Likes:</b> ${image.likes}</p>
          <p><b>Views:</b> ${image.views}</p>
          <p><b>Comments:</b> ${image.comments}</p>
          <p><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </a>
    `
    )
    .join('');

  if (append) {
    gallery.insertAdjacentHTML('beforeend', markup);
  } else {
    gallery.innerHTML = markup;
  }
}

function clearGallery() {
  gallery.innerHTML = '';
}

function toggleLoader(isLoading) {
  if (isLoading) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}
