document.getElementById('bookingForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  // Retrieve listing_id from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const listing_id = urlParams.get('listing_id');

  // Collect booking details from the form
  const booking = {
    listing_id,
    clientName: document.getElementById('clientName').value,
    email: document.getElementById('email').value,
    daytimePhone: document.getElementById('daytimePhone').value,
    mobile: document.getElementById('mobile').value,
    postalAddress: document.getElementById('postalAddress').value,
    homeAddress: document.getElementById('homeAddress').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value
  };

  // Log the booking details on the client side before sending to the server
  console.log('Submitting booking:', booking);

  // Save booking to the server
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });

  if (response.ok) {
    console.log('Booking successfully sent to server');
  } else {
    console.error('Failed to submit booking');
  }

  // Redirect to confirmation.html with booking details in the URL as query parameters
  const queryString = new URLSearchParams(booking).toString();
  window.location.href = `confirmation.html?${queryString}`;
});