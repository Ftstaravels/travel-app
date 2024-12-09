async function searchReservation() {
  const bookingNumber = document.getElementById('reservationNumber').value.trim();
  const reservationDetails = document.getElementById('reservationDetails');
  const hotelMap = document.getElementById('hotelMap');

  if (!bookingNumber) {
    reservationDetails.innerHTML = `<p style="color: red;">Please enter a booking number!</p>`;
    return;
  }

  reservationDetails.innerHTML = `<p>Searching for booking number: ${bookingNumber}...</p>`;

  const AIRTABLE_API_KEY = 'patQOaBOrGkUBYRl3.b8696f12249d11f47dea24f4aa4812556f1315c30a9b79cb4577b905c06ae7d9'; 
  const BASE_ID = 'appTp5YgSp9DV2HYc';
  const TABLE_NAME = 'List';

  const endpoint = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula={Booking Nr.}="${bookingNumber}"`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    const data = await response.json();

    if (data.records.length > 0) {
      const record = data.records[0].fields;
      const tripDate = new Date(record['Date Trip']);
      const formattedDate = `${tripDate.getDate().toString().padStart(2, '0')}/${(tripDate.getMonth() + 1).toString().padStart(2, '0')}/${tripDate.getFullYear()}`;

      reservationDetails.innerHTML = `
        <p><strong>Booking Nr.:</strong> ${record['Booking Nr.']}</p>
        <p><strong>Customer Name:</strong> ${record['Customer Name']}</p>
        <p><strong>Date Trip:</strong> ${formattedDate}</p>
        <p><strong>Pickup Time:</strong> ${record['pickup time']}</p>
        <p><strong>Hotel Name:</strong> ${record['Hotel name']}</p>
      `;

      // Display map for the hotel
      const hotelName = record['Hotel name'];
      const hotelAddress = `${hotelName}, some address here`; // You can modify this with actual address data
      showHotelMap(hotelAddress);

    } else {
      reservationDetails.innerHTML = `<p style="color: red;">No booking found for this number.</p>`;
      hotelMap.style.display = 'none'; // Hide map if no booking found
    }
  } catch (error) {
    reservationDetails.innerHTML = `<p style="color: red;">Error fetching reservation data. Please try again later.</p>`;
    console.error(error);
  }
}

function showHotelMap(address) {
  const hotelMap = document.getElementById('hotelMap');
  hotelMap.style.display = 'block'; // Show the map container

  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ 'address': address }, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      const map = new google.maps.Map(hotelMap, {
        center: results[0].geometry.location,
        zoom: 15
      });

      new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        title: address
      });
    } else {
      console.error("Geocode failed: " + status);
      hotelMap.style.display = 'none'; // Hide map if geocoding fails
    }
  });
}
