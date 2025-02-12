let currentSkip = 0; // Tracks how many listings are currently displayed
const limit = 10; // Number of listings to load at once
let allListings = []; // Stores all relevant listings

// Fetch and display 10 random listings when the page loads
async function fetchRandomListings() {
  const response = await fetch("/api/randomListings"); // Endpoint for random listings
  const listings = await response.json();
  displayListings(listings, "random");
}

function displayListings(listings, type) {
  const listingsTable =
    type === "random"
      ? document.getElementById("listingsTable")
      : document.getElementById("searchListingsBody");
  listingsTable.innerHTML = ""; // Clear previous listings

  listings.forEach((listing) => {
    const row = document.createElement("tr");
    const price = listing.price
      ? `$${parseFloat(listing.price.$numberDecimal).toFixed(2)}`
      : "N/A";

    // Display review score as "N/A" or "score%" if a score is present
    const reviewScore =
      listing.review_scores &&
      listing.review_scores.review_scores_rating !== undefined
        ? `${listing.review_scores.review_scores_rating}%`
        : "N/A";

    row.innerHTML = `
      <td><a href="bookings.html?listing_id=${listing._id}">${listing.name}</a></td>
      <td>${listing.summary}</td>
      <td>${price}</td>
      <td>${reviewScore}</td>
    `;
    listingsTable.appendChild(row);
  });
}

// Handle search form submission
document
  .getElementById("searchForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const location = document.getElementById("location").value;
    const propertyType = document.getElementById("propertyType").value;
    const bedrooms = document.getElementById("bedrooms").value;

    // Fetch filtered listings based on user input
    const response = await fetch(
      `/api/listings?location=${location}&propertyType=${propertyType}&bedrooms=${bedrooms}&limit=${limit}&skip=0`
    );
    allListings = await response.json(); // Store all relevant listings

    // Show search results
    displayListings(allListings, "search");

    // Hide random listings elements
    document.getElementById("randomListingsHeader").style.display = "none"; // Hide random listings header
    document.getElementById("randomListingsTable").style.display = "none"; // Hide random listings table
    document.getElementById("searchResultsHeader").style.display = "block"; // Show search results header
    document.getElementById("searchResultsTable").style.display = "table"; // Show search results table

    // Remove the Load More button functionality
  });

// Fetch random listings on initial page load
fetchRandomListings();
