// public/app.js

// Function to initialize the app based on login status
function initializeApp() {
    fetch('/current-user', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            // User is logged in
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('signup-section').style.display = 'none';
            document.getElementById('content-section').style.display = 'block';
            document.getElementById('profile-btn').style.display = 'block';
            document.getElementById('logout-btn').style.display = 'block';
            loadAllMovies();
        } else {
            // User is not logged in
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('signup-section').style.display = 'block';
            document.getElementById('content-section').style.display = 'none';
            document.getElementById('profile-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
    });
}

// Event listener for login
function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('username').value;
        
            if (!username) {
                alert('Please enter your name');
                return;
            }
        
            // Send POST request to the server for login
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: username })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Login successful!');
                    initializeApp();
                } else {
                    alert('Login failed!');
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
            });
        });
    }
}

// Event listener for signup
function setupSignup() {
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            const username = document.getElementById('signup-username').value;
    
            if (!username) {
                alert('Please enter a username');
                return;
            }
    
            fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: username })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('User registered successfully!');
                    initializeApp();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error during sign up:', error));
        });
    }
}

// Logout function
function logout() {
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Logged out successfully!');
            initializeApp();
        } else {
            alert('Logout failed!');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

// Function to get movies by genre
function getMoviesByTag(tag) {
    fetch(`/api/movies/tag/${tag}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(movies => {
        const moviesList = document.getElementById('movies-list');
        moviesList.innerHTML = ''; // Clear previous movies
        if (movies.length === 0) {
            moviesList.innerHTML = '<p class="text-center text-gray-600">No movies found for this genre</p>';
        } else {
            movies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'bg-white rounded-lg shadow-md p-4';
                movieCard.innerHTML = `
                    <h3 class="text-lg font-semibold mb-2">${movie.title}</h3>
                    <p class="text-sm text-gray-600 mb-4">${movie.tags.join(', ')}</p>
                    <button onclick="viewMovie(${movie.id})" class="bg-softBlue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded w-full">
                        View Details
                    </button>
                `;
                moviesList.appendChild(movieCard);
            });
        }
    })
    .catch(error => console.error('Error loading movies:', error));
}

// Navigate to movie details page
function viewMovie(movieId) {
    window.location.href = `/movie.html?id=${movieId}`;
}

// Function to post a review
function postReview() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const reviewText = document.getElementById('review-text').value;

    if (!reviewText) {
        alert('Please enter a review');
        return;
    }

    fetch(`/api/movies/${movieId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ review: reviewText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Review posted successfully!');
            document.getElementById('review-text').value = ''; // Clear the textarea
            loadReviews(movieId); // Reload reviews after posting
        } else {
            alert('Failed to post review.');
        }
    })
    .catch(error => console.error('Error posting review:', error));
}

// Function to load reviews for the movie
function loadReviews(movieId) {
    fetch(`/api/movies/${movieId}/reviews`, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(reviews => {
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.innerHTML = ''; // Clear previous reviews
            if (reviews.length === 0) {
                reviewsList.innerHTML = '<p>No reviews yet.</p>';
            } else {
                reviews.forEach(review => {
                    const reviewItem = document.createElement('div');
                    reviewItem.className = 'review-item bg-gray-100 p-4 rounded-lg shadow-md mb-4'; // Added styling
                    reviewItem.innerHTML = `
                        <strong class="text-lg">${review.username}</strong>
                        <p class="text-gray-700">${review.review}</p>
                    `;
                    reviewsList.appendChild(reviewItem);
                });
            }
        })
        .catch(error => console.error('Error loading reviews:', error));
}

// Function to add a movie to a list
function addToList(listType) {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    fetch(`/api/user/${listType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ movieId: parseInt(movieId) })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`${capitalizeFirstLetter(listType)} list updated!`);
        } else {
            alert('Failed to update list.');
        }
    })
    .catch(error => console.error('Error adding to list:', error));
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to load all movies and generate genre buttons
function loadAllMovies() {
    fetch('/api/movies', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(movies => {
            const moviesList = document.getElementById('movies-list');
            moviesList.innerHTML = ''; // Clear previous movies
            const tagsSet = new Set(); // To store unique tags

            movies.forEach(movie => {
                // Create movie card
                const movieCard = document.createElement('div');
                movieCard.className = 'bg-white rounded-lg shadow-md p-4';
                movieCard.innerHTML = `
                    <h3 class="text-lg font-semibold mb-2">${movie.title}</h3>
                    <p class="text-sm text-gray-600 mb-4">${movie.tags.join(', ')}</p>
                    <button onclick="viewMovie(${movie.id})" class="bg-softBlue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded w-full">
                        View Details
                    </button>
                `;
                moviesList.appendChild(movieCard);

                // Add tags to the set
                movie.tags.forEach(tag => tagsSet.add(tag));
            });

            // Generate genre buttons
            const genreButtons = document.getElementById('genre-buttons');
            genreButtons.innerHTML = ''; // Reset the genre buttons

            tagsSet.forEach(tag => {
                const button = document.createElement('button');
                button.className = 'bg-vibrantOrange hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded transition duration-300';
                button.innerText = tag;
                button.onclick = () => getMoviesByTag(tag.toLowerCase());
                genreButtons.appendChild(button);
            });
        })
        .catch(error => console.error('Error loading movies:', error));
}

// Function to load movie details on movie.html
function loadMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        alert('No movie ID provided');
        return;
    }

    // Fetch movie details
    fetch(`/api/movies/${movieId}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(movie => {
        document.getElementById('movie-title').innerText = movie.title;
        document.getElementById('movie-description').innerText = movie.description || 'No description available.';
    })
    .catch(error => console.error('Error loading movie details:', error));

    // Load reviews
    loadReviews(movieId);
}


// Function to load profile data on profile.html
function loadProfile() {
    Promise.all([
        fetch('/api/profile', {
            method: 'GET',
            credentials: 'include'
        }),
        fetch('/api/movies', {
            method: 'GET',
            credentials: 'include'
        })
    ])
    .then(async ([profileRes, moviesRes]) => {
        if (!profileRes.ok || !moviesRes.ok) {
            throw new Error('Failed to fetch data');
        }
        const profile = await profileRes.json();
        const movies = await moviesRes.json();

        // Create a map of movieId to movieTitle
        const movieMap = {};
        movies.forEach(movie => {
            movieMap[movie.id] = movie.title;
        });

        // Helper function to convert movie IDs to titles
        function convertIdsToTitles(ids) {
            if (!ids || ids.length === 0) return 'None';
            return ids.map(id => movieMap[id] || `ID ${id}`).join(', ');
        }

        // Update profile sections
        document.getElementById('favorites-list').innerText = convertIdsToTitles(profile.favorites);
        document.getElementById('watched-list').innerText = convertIdsToTitles(profile.watched);
        document.getElementById('watching-list').innerText = convertIdsToTitles(profile.watching);
        document.getElementById('wishlist-list').innerText = convertIdsToTitles(profile.wishlist);
    })
    .catch(error => {
        console.error('Error loading profile:', error);
        alert('Failed to load profile.');
    });
}

// Event listener for profile button
function setupProfileButton() {
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = '/profile.html';
        });
    }
}

// Event listener for logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

// Call initializeApp when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupLogin();
    setupSignup();
    setupProfileButton();
    setupLogoutButton();

    // Check if on movie.html by looking for a unique element
    if (document.getElementById('movie-title')) {
        loadMovieDetails();
    }

    // Check if on profile.html by looking for a unique element
    if (document.getElementById('favorites-list')) {
        loadProfile();
        setupBackButton(); // Optional: If you have a back button
    }

    // Additional page-specific initializations can be added here
});

// Optional: Function to handle back button on profile.html
function setupBackButton() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }
}
