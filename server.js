require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const app = express();
const PORT = 3000;

// MongoDB connection URI and setup
const uri = process.env.URI;
const client = new MongoClient(uri);

let db, listingsCollection, bookingsCollection;

async function connectToDatabase() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    const db = client.db("sample_airbnb");
    listingsCollection = db.collection("listingsAndReviews");
    bookingsCollection = db.collection("bookings");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return;
  }
}

// Call the function to connect to the database
connectToDatabase().catch(console.error);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Homepage: Serve the HTML page with a script for fetching random listings
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Make sure you have an index.html file in the public directory
});

// Random Listings: Fetch 10 random listings
app.get("/api/randomListings", async (req, res) => {
  try {
    const randomListings = await listingsCollection
      .aggregate([
        { $sample: { size: 10 } }, // Randomly sample 10 listings
        {
          $project: {
            name: 1,
            summary: 1,
            price: 1,
            "review_scores.review_scores_rating": 1,
          },
        },
      ])
      .toArray();

    res.json(randomListings);
  } catch (error) {
    console.error("Error fetching random listings:", error);
    res.status(500).json({ error: "Failed to fetch random listings" });
  }
});

// Homepage: Fetch filtered property listings
app.get("/api/listings", async (req, res) => {
  const { location, propertyType, bedrooms, limit = 10, skip = 0 } = req.query;
  const query = {};

  if (location) query["address.market"] = location;
  if (propertyType) query["property_type"] = propertyType;
  if (bedrooms) query["bedrooms"] = parseInt(bedrooms, 10);

  try {
    const listings = await listingsCollection
      .find(query)
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .project({
        name: 1,
        summary: 1,
        price: 1,
        "review_scores.review_scores_rating": 1,
      })
      .toArray();

    res.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Endpoint for creating a new booking
app.post("/api/bookings", async (req, res) => {
  try {
    console.log("Received new booking request:", req.body);

    // Retrieve the booking with the highest current booking_id
    const lastBooking = await bookingsCollection
      .find({})
      .sort({ booking_id: -1 })
      .limit(1)
      .toArray();

    // Calculate the new booking ID
    const newBookingId =
      lastBooking.length > 0 ? lastBooking[0].booking_id + 1 : 1;

    const bookingData = {
      booking_id: newBookingId,
      listing_id: req.body.listing_id,
      clientName: req.body.clientName,
      email: req.body.email,
      daytimePhone: req.body.daytimePhone,
      mobile: req.body.mobile,
      postalAddress: req.body.postalAddress,
      homeAddress: req.body.homeAddress,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };

    console.log("Inserting booking into database:", bookingData);

    // Insert the new booking into the bookings collection
    const result = await bookingsCollection.insertOne(bookingData);
    console.log("Booking successfully inserted:", result.insertedId);

    res.status(201).json({ bookingId: result.insertedId });
  } catch (error) {
    console.error("Failed to add booking", error);
    res.status(500).send("Server error");
  }
});

// Confirmation Page: Retrieve booking details by ID
app.get("/api/bookings/:id", async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId),
    });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
});

// Error handlers
app.use((req, res, next) => {
  res.status(404).send("Not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

// Run server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
