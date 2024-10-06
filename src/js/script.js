import axios from 'axios';
import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';


const API_KEY = '46331793-9cec4180ce0cddf1fbb8fc669'; 
const form = document.querySelector('.search-form');
const gallery = document.querySelector('#gallery');
const loader = document.querySelector('#loader');
// const loadMoreBtn = document.querySelector('.load-more')
const loadMoreBtn = document.createElement('button');
loadMoreBtn.textContent = 'Load more';
loadMoreBtn.classList.add('load-more');
document.body.append(loadMoreBtn); 
loadMoreBtn.style.display = 'none'; 

let query = '';
let page = 1;
let perPage = 40;
let lightbox;


async function fetchImages(query, page) {
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  
  try {
    loader.style.display = 'block'; 
    const response = await axios.get(URL);
    loader.style.display = 'none'; 
    return response.data;
  } catch (error) {
    console.error('Błąd w zapytaniu:', error);
    loader.style.display = 'none'; 
    iziToast.error({
      title: 'Error',
      message: 'Problem with fetching images',
    });
    return { hits: [], totalHits: 0 };
  }
}


function displayImages(images) {
  if (page === 1) {
    gallery.innerHTML = '';
    gallery.classList.remove('hidden');
  }
  
  const markup = images.map(image => `
    <a href="${image.largeImageURL}" class="gallery-item">
      <img src="${image.webformatURL}" alt="${image.tags}" />
      <div class="image-info">
        <p><span class="image-info-label">Likes:</span> <span class="image-info-value">${image.likes}</span></p>
        <p><span class="image-info-label">Views:</span> <span class="image-info-value">${image.views}</span></p>
        <p><span class="image-info-label">Comments:</span> <span class="image-info-value">${image.comments}</span></p>
        <p><span class="image-info-label">Downloads:</span> <span class="image-info-value">${image.downloads}</span></p>
      </div>
    </a>
  `).join('');

  gallery.insertAdjacentHTML('beforeend', markup); 

  if (lightbox) {
    lightbox.refresh();
  } else {
    lightbox = new SimpleLightbox('.gallery-item', { captionsData: 'alt', captionDelay: 250 });
  }
}


async function handleImagesRequest() {
  const data = await fetchImages(query, page);

  if (data.hits.length === 0 && page === 1) {
    iziToast.info({
      iconUrl: './src/img/no-images-icon.png',
      message: 'Sorry, there are no images matching your search query. Please, try again!',
      backgroundColor: '#EF4040',
    });
    loadMoreBtn.style.display = 'none';
    return;
  }

  displayImages(data.hits);

  if (data.hits.length < perPage || (page * perPage) >= data.totalHits) {
    loadMoreBtn.style.display = 'none';
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
    });
  } else {
    loadMoreBtn.style.display = 'block';
  }

  
  if (page > 1) {
    const { height: galleryItemHeight } = document.querySelector('.gallery-item').getBoundingClientRect();
    window.scrollBy({
      top: galleryItemHeight * 2,
      behavior: 'smooth',
    });
  }
}


form.addEventListener('submit', async (event) => {
  event.preventDefault();
  query = document.querySelector('#query').value.trim();

  if (query) {
    page = 1;
    loadMoreBtn.style.display = 'none';
    await handleImagesRequest();
  }
});


loadMoreBtn.addEventListener('click', async () => {
  page += 1; 
  await handleImagesRequest(); 
});