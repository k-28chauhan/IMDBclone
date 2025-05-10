const API_KEY = "1f157746d70cc92b68de298e4fb4c85f";//dont use this
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const error = document.getElementById("error");
const movieContainer = document.getElementById("movie-container");
const search = document.getElementById("search");
const trendingMovieContainer = document.getElementById("trending-movies");
const trendingShowContainer = document.getElementById("trending-shows");
const carouselContainer = document.querySelectorAll(".carousel-container");

search.addEventListener("input", (e) => {
    const query = e.target.value;
    if (query === "") {
        error.innerHTML = "";
        movieContainer.innerHTML = "";
        carouselContainer.forEach(carousel => carousel.style.display = "block");
    }
    else {
        carouselContainer.forEach(carousel => carousel.style.display = "none");
        getMovies(query);
    }
});

async function showTrailer(id, type) {
    try {
        const fetchVideos = async (id, type) => {
            const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
            const data = await res.json();
            return data.results;
        };
        const videos = await fetchVideos(id, type);
        const modalContent = document.getElementById('modal-content'); // A div inside modal
        modalContent.innerHTML = `
            <div class="swiper trailerSwiper">
                <div class="swiper-wrapper">
                    ${videos.map(video => `
                        <div class="swiper-slide">
                            <iframe id="video-source" width="100%" height="450" 
                                src="https://www.youtube.com/embed/${video.key}" 
                                title="${video.name}" 
                                frameborder="0" allowfullscreen>
                            </iframe>
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-button-next bg-black opacity-50 text-white w-10 h-16 hover:opacity-70"></div>
                <div class="swiper-button-prev bg-black opacity-50 text-white w-10 h-16 hover:opacity-70"></div>
            </div>
        `;
        new Swiper('.trailerSwiper', {
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            loop: true,
        });

        // Open Modal
        document.getElementById('trailer-modal').classList.remove('hidden');

    } catch (error) {
        console.error("Error finding video", error);
    }
}

async function watchOptions(id, type) {

    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        const details = await response.json();

        const credits = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
        const creditsData = await credits.json();
        const cast = creditsData.cast.slice(0,2).map(actor => actor.name).join(" • ");
        const director = creditsData.crew.find(crewMember => crewMember.job ==="Director" || crewMember.known_for_department==="Directing")?.name || "Unknown";
        console.log(creditsData);

        const runTime = details.runTime || 0;
        const runTimeHour = Math.floor(details.runtime / 60);
        const runTimeMinutes = details.runtime % 60;
        console.log(details);

        const watchProvider = await fetch(`${BASE_URL}/${type}/${id}/watch/providers?api_key=${API_KEY}`);
        const data = await watchProvider.json();

        const providerInfo = data.results?.IN
        let defaultHTML = `
        <div class="text-xl font-bold">Not available in your region</div>
        `;

        if(providerInfo?.flatrate?.length>0){
            const provider = providerInfo.flatrate[0];
            defaultHTML = `
            <div class="flex py-2 pl-1 gap-3 hover:bg-neutral-700 transition delay-75">
                 <img class="size-12 rounded-2xl" src="https://image.tmdb.org/t/p/w500${provider.logo_path}" alt="">
                 <div>
                     <div class="text-xl font-bold">${provider.provider_name}</div>
                     <div class="text-stone-400">with subscription</div>
                 </div>
             </div>
            `;
        }

        const modalContent = document.getElementById('modal-content1');
        modalContent.innerHTML = `
             <div class="flex gap-3 h-28">
                 <div><img class="h-28 w-20" src="${IMAGE_URL + details.poster_path}"></div>
                 <div class="text-stone-400">
                     <div class="text-2xl text-white">${details.title || details.name}</div>
                     <div>${(details.first_air_date || details.release_date)?.substring(0,4)} • ${runTimeHour}hr ${runTimeMinutes}min</div>
                     <div>Drama</div>
                     <div class="flex gap-2">
                         <img class="mt-1 size-4" src="images/star.png" alt="">
                         <span class="text-lg">${details.vote_average.toFixed(1)}</span>
                     </div>
                 </div>
             </div>
             <div class="pt-3 ">${details.overview}</div>
             <div class="flex gap-4 mt-3">
                 <div class="font-bold">Stars</div>
                 <div class="text-blue-500"><span>${cast}</span></div>
             </div>
             <div class="flex gap-4 mt-2">
                 <div class="font-bold">Director</div>
                 <div class="text-blue-500"><span>${director}</span></div>
             </div>
             <div class="flex flex-col md:flex-row gap-2 justify-around mt-5">
                 <div>
                     <button onclick="showTrailer(${id}, '${type}')"
                         class="flex justify-center
                         gap-2 w-60 md:w-72 text-xl bg-zinc-700 rounded-2xl px-2 py-1 text-blue-400 transition delay-50 hover:bg-zinc-800">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             class="size-6 pt-0.5">
                             <path fill-rule="evenodd"
                                 d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                 clip-rule="evenodd" />
                         </svg>
                         Trailer
                     </button>
                 </div>
                 <div>
                     <button
                         class="w-60 md:w-72 text-xl bg-zinc-700 rounded-2xl px-2 py-1 text-blue-400 transition delay-50 hover:bg-zinc-800">
                         <span class="font-bold">+</span> Watchlist
                     </button>
                 </div>
             </div>
             <div class="text-xl mt-2 mb-2 text-yellow-500">Streaming</div>
             <hr>
             ${defaultHTML}
             <hr>
         </div>
    `;
    document.getElementById('watch-options').classList.remove('hidden');
    } catch (error) {
        console.error("Error finding video", error);
    }

    
}

function closeModal() {
    document.getElementById('trailer-modal').classList.add('hidden');
    document.getElementById('watch-options').classList.add('hidden');
    document.getElementById("video-source").setAttribute("src", "");
}

async function trendingShows() {
    try {
        const res = await fetch(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`);
        const data = await res.json();
        const movies = data.results;
        console.log(movies);

        trendingShowContainer.innerHTML = "";
        movies.forEach(movie => {
            const slide = document.createElement("div");
            slide.className = "swiper-slide rounded-lg overflow-hidden relative bg-zinc-900 text-white w-44 h-96 ";
            slide.innerHTML = `
            <div class="h-56">
                    <img class="h-full w-full object-fill rounded-t-lg" src="${IMAGE_URL + movie.poster_path}" alt="${movie.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"
                        class="absolute top-[-7px] left-[-10px] size-14 opacity-75">
                        <path class=" hover:opacity-50" fill-rule="evenodd"
                            d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                            clip-rule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="absolute top-1.5 left-1.5 size-6">
                        <path fill-rule="evenodd"
                            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="flex justify-between mt-2 w-32 lg:w-48">
                    <div class="pl-3 py-1 text-lg lg:text-xl w-52 h-16 line-clamp-2">${movie.name}</div>
                    <div class="flex w-20 py-2 mr-1 gap-1">
                        <img class="mt-1 size-4" src="images/star.png" alt="">
                        <span class=" text-xl text-gray-400">${movie.vote_average.toFixed(1)}</span>
                    </div>
                </div>
                <div class="flex flex-col items-center mt-2">
                    <button onclick="watchOptions(${movie.id}, 'tv')" class="w-36 lg:w-44 text-xl bg-zinc-700 rounded-2xl px-2 py-0.5 text-blue-400 transition delay-50 hover:bg-zinc-800">
                        Watch Options
                    </button>
                    <div class="flex mt-2 justify-between w-36 lg:w-44">
                        <button onclick="showTrailer(${movie.id}, 'tv')" class="flex
                    gap-2 px-3 py-1 text-xl-28 rounded-2xl transition delay-50 hover:bg-zinc-800">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                            Trailer
                        </button>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
    
                        </button>
                    </div>
                </div>
            `;
            trendingShowContainer.appendChild(slide);
        });

    }
    catch (error) {
        console.error("Something went wrong", error);
    }
}
trendingShows();

async function trendingMovies() {
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
        const data = await res.json();
        const movies = data.results;
        console.log(movies);
        trendingMovieContainer.innerHTML = "";
        movies.forEach(movie => {
            const slide = document.createElement("div");
            slide.className = "swiper-slide rounded-lg overflow-hidden relative bg-zinc-900 text-white w-60 h-96";
            slide.innerHTML = `
            <div class="h-56">
                    <img class="h-full w-full object-fill rounded-t-lg" src="${IMAGE_URL + movie.poster_path}" alt="${movie.title || movie.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"
                        class="absolute top-[-7px] left-[-10px] size-14 opacity-75">
                        <path class=" hover:opacity-50" fill-rule="evenodd"
                            d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                            clip-rule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="absolute top-1.5 left-1.5 size-6">
                        <path fill-rule="evenodd"
                            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="flex justify-between mt-2 w-32 lg:w-48">
                    <div class="pl-3 py-1 text-lg lg:text-xl w-60 h-16 line-clamp-2">${movie.title}</div>
                    <div class="flex w-20 py-2 mr-1 gap-1">
                        <img class="mt-1 size-4" src="images/star.png" alt="">
                        <span class=" text-xl text-gray-400">${movie.vote_average.toFixed(1)}</span>
                    </div>
                </div>
                <div class="flex flex-col items-center mt-2">
                    <button onclick="watchOptions(${movie.id}, 'movie')"
                        class="w-36 lg:w-44 text-xl bg-zinc-700 rounded-2xl px-2 py-0.5 text-blue-400 transition delay-50 hover:bg-zinc-800">
                        Watch Options
                    </button>
                    <div class="flex mt-2 justify-between w-36 lg:w-44">
                        <button onclick="showTrailer(${movie.id}, 'movie')" class="flex
                    gap-2 px-3 py-1 text-xl-28 rounded-2xl transition delay-50 hover:bg-zinc-800">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                            Trailer
                        </button>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
    
                        </button>
                    </div>
                </div>
            `;
            trendingMovieContainer.appendChild(slide);
        });
    }
    catch (error) {
        console.error("Something went wrong", error);
    }
}
trendingMovies();

async function getMovies(query) {
    try {
        const [movieResponse, tvResponse] = await Promise.all([
            fetch(`${BASE_URL}/search/movie?query=${query}&api_key=${API_KEY}`),
            fetch(`${BASE_URL}/search/tv?query=${query}&api_key=${API_KEY}`)
        ]);
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();

        const movieResults = movieData.results.map(item => ({ ...item, media_type: "movie" }));
        console.log(movieResults);
        const tvResults = tvData.results.map(item => ({ ...item, media_type: "tv" }));

        const combinedData = [...movieResults, ...tvResults];
        if (combinedData.length > 0) {
            displayMovie(combinedData);
        }
        else {
            displayError();
        }
    }
    catch (error) {
        console.error("Error fetching Movie/TV show", error);
    }
}

function displayError() {
    movieContainer.innerHTML = "";
    error.innerHTML = "";
    const errorMessage = document.createElement("div");
    errorMessage.innerHTML = "No Results Found! :("
    errorMessage.classList.add("text-white", "text-5xl");
    error.appendChild(errorMessage);
}

function displayMovie(movies) {
    error.innerHTML = "";
    movieContainer.innerHTML = "";
    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "relative bg-zinc-900 text-white rounded-lg w-52 h-96 transform transition-transform duration-300 hover:scale-110";

        card.innerHTML = `
        <div class="h-56">
                    <img class="h-full w-full object-fill rounded-t-lg" src="${IMAGE_URL + movie.poster_path}" alt="${movie.title || movie.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"
                        class="absolute top-[-7px] left-[-10px] size-14 opacity-75">
                        <path class=" hover:opacity-50" fill-rule="evenodd"
                            d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                            clip-rule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="absolute top-1.5 left-1.5 size-6">
                        <path fill-rule="evenodd"
                            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                            clip-rule="evenodd" />
                    </svg>
    
    
    
                </div>
                <div class="flex justify-between mt-2">
                    <div class="pl-3 py-1 text-xl w-60 h-16 line-clamp-2">${movie.title || movie.name}</div>
                    <div class="flex w-20
                    py-2 mr-2 gap-2">
                        <img class="mt-0.5 size-5" src="images/star.png" alt="">
                        <span class=" text-xl text-gray-400">${movie.vote_average.toFixed(1)}</span>
                    </div>
                </div>
                <div class="flex flex-col items-center mt-2">
                    <button onclick="watchOptions(${movie.id}, '${movie.media_type}')"
                        class="w-44 text-xl bg-zinc-700 rounded-2xl px-2 py-0.5 text-blue-400 transition delay-50 hover:bg-zinc-800">
                        Watch Options
                    </button>
                    <div class="flex mt-2 justify-between w-44">
                        <button onclick="showTrailer(${movie.id}, '${movie.media_type}')" class="flex
                    gap-2 px-3 py-1 text-xl-28 rounded-2xl transition delay-50 hover:bg-zinc-800">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                            Trailer
                        </button>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
    
                        </button>
                    </div>
                </div>
        `;
        movieContainer.appendChild(card);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Swiper
    new Swiper('.mySwiper', {
        slidesPerView: 2, // default for mobile
        spaceBetween: 16,
        loop: false,
        speed: 1000,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          425: {
            slidesPerView: 2.5, // sm screens
            slidesPerGroup: 2
          },
          640: {
            slidesPerView: 3, // md screens
          },
          680: {
            slidesPerView: 3.5,
            slidesPerGroup: 3
          },
          720: {
            slidesPerView: 4, // lg screens and above
            slidesPerGroup: 4
          },
          1024: {
            slidesPerView: 5,
            slidesPerGroup: 5
          }
        }
      });

});