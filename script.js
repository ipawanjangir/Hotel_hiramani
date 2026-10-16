/* ============ MOBILE MENU ============ */
function toggleMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
  document.body.style.overflow = document.getElementById('mobileMenu').classList.contains('open') ? 'hidden' : '';
}

/* ============ GALLERY FILTER ============ */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

/* ============ CALENDAR ============ */
let currentDate = new Date();
let checkinDate = null;
let checkoutDate = null;

const bookedDates = [
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toDateString(),
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 11).toDateString(),
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 12).toDateString(),
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 25).toDateString(),
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 26).toDateString(),
];

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  document.getElementById('calMonth').textContent =
    currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.textContent = d;
    grid.appendChild(el);
  });

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toDateString();

    if (dateObj < today) {
      el.classList.add('disabled');
    } else if (bookedDates.includes(dateStr)) {
      el.classList.add('disabled');
      el.title = 'Not available';
    } else {
      if (dateObj.toDateString() === today.toDateString()) el.classList.add('today');
      if (checkinDate && dateObj.toDateString() === checkinDate.toDateString()) el.classList.add('selected');
      if (checkoutDate && dateObj.toDateString() === checkoutDate.toDateString()) el.classList.add('selected');
      if (checkinDate && checkoutDate && dateObj > checkinDate && dateObj < checkoutDate) {
        el.classList.add('in-range');
      }
      el.addEventListener('click', () => selectDate(dateObj));
    }
    grid.appendChild(el);
  }
}

function selectDate(date) {
  if (!checkinDate || (checkinDate && checkoutDate)) {
    checkinDate = date;
    checkoutDate = null;
  } else if (date > checkinDate) {
    checkoutDate = date;
  } else {
    checkinDate = date;
    checkoutDate = null;
  }
  updateForm();
  renderCalendar();
}

function updateForm() {
  const fmt = d => d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  document.getElementById('checkin').value = fmt(checkinDate);
  document.getElementById('checkout').value = fmt(checkoutDate);
  updateSummary();
}

function updateSummary() {
  const roomSel = document.getElementById('roomType');
  const rate = parseInt(roomSel.value.split('-')[1]);
  document.getElementById('sumRate').textContent = '₹' + rate.toLocaleString() + '/night';
  let nights = 0;
  if (checkinDate && checkoutDate) {
    nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  }
  document.getElementById('sumNights').textContent = nights;
  document.getElementById('sumTotal').textContent = '₹' + (rate * nights).toLocaleString();
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}
function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

/* Room type change */
document.getElementById('roomType').addEventListener('change', updateSummary);

/* ============================================
   BOOKING SYSTEM — Popup + localStorage + WhatsApp
   ============================================ */

let pendingBooking = null;

/* ---------- STEP 1: Form submit → Popup dikhao ---------- */
function handleBooking(e) {
  e.preventDefault();

  const name  = document.getElementById('guestName').value.trim();
  const phone = document.getElementById('guestPhone').value.trim();

  if (!checkinDate || !checkoutDate) {
    alert('Please select check-in and check-out dates from the calendar.');
    return;
  }
  if (!name || !phone) {
    alert('Please fill your name and phone number.');
    return;
  }

  const roomSel  = document.getElementById('roomType');
  const roomText = roomSel.options[roomSel.selectedIndex].text;
  const roomShort = roomSel.value.split('-')[0]; // standard / deluxe
  const rate   = parseInt(roomSel.value.split('-')[1]);
  const guests = document.getElementById('guestCount').value;
  const nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  const total  = rate * nights;

  // Save pending booking
  pendingBooking = {
    id: 'BK' + Date.now(),
    name: name,
    phone: phone,
    room: roomShort.charAt(0).toUpperCase() + roomShort.slice(1) + ' Room',
    roomFull: roomText,
    checkin: checkinDate.toDateString(),
    checkout: checkoutDate.toDateString(),
    checkinShort: checkinDate.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}),
    checkoutShort: checkoutDate.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}),
    guests: guests,
    nights: nights,
    rate: rate,
    total: total,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  // Fill popup fields
  document.getElementById('popName').textContent     = name;
  document.getElementById('popPhone').textContent    = phone;
  document.getElementById('popRoom').textContent     = pendingBooking.roomFull;
  document.getElementById('popCheckin').textContent  = pendingBooking.checkin;
  document.getElementById('popCheckout').textContent = pendingBooking.checkout;
  document.getElementById('popGuests').textContent   = guests;
  document.getElementById('popTotal').textContent    = '₹' + total.toLocaleString();

  // Show popup
  document.getElementById('bookingPopup').classList.add('open');
}

/* ---------- STEP 2: Popup close ---------- */
function closePopup() {
  document.getElementById('bookingPopup').classList.remove('open');
}

/* ---------- STEP 3: Confirm → Save + WhatsApp ---------- */
function confirmBookingFinal() {
  if (!pendingBooking) return;

  // 1) Save to localStorage (admin panel reads from here)
  const existing = JSON.parse(localStorage.getItem('hiramani_bookings') || '[]');
  existing.unshift(pendingBooking);
  localStorage.setItem('hiramani_bookings', JSON.stringify(existing));

  // 2) Build WhatsApp message
  const msg =
    `*New Booking — Hiramani Hotel*%0A%0A` +
    `*Booking ID:* ${pendingBooking.id}%0A` +
    `*Name:* ${pendingBooking.name}%0A` +
    `*Phone:* ${pendingBooking.phone}%0A` +
    `*Room:* ${pendingBooking.roomFull}%0A` +
    `*Check-in:* ${pendingBooking.checkin}%0A` +
    `*Check-out:* ${pendingBooking.checkout}%0A` +
    `*Nights:* ${pendingBooking.nights}%0A` +
    `*Guests:* ${pendingBooking.guests}%0A` +
    `*Total:* ₹${pendingBooking.total.toLocaleString()}%0A%0A` +
    `Please confirm my booking. 🙏`;

  // 3) Open WhatsApp
  window.open(`https://wa.me/919509777684?text=${msg}`, '_blank');

  // 4) Close popup + show success toast
  closePopup();
  showToast();

  // 5) Reset form (after small delay)
  setTimeout(() => {
    document.getElementById('bookingForm').reset();
    checkinDate = null;
    checkoutDate = null;
    renderCalendar();
    updateSummary();
    pendingBooking = null;
  }, 500);
}

/* ---------- SUCCESS TOAST ---------- */
function showToast() {
  const t = document.getElementById('successToast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

/* ---------- Click outside to close popup ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('bookingPopup');
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target.id === 'bookingPopup') closePopup();
    });
  }
});

/* ---------- ESC key closes popup ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});

/* ---------- BOOK ON WHATSAPP (direct) ---------- */
function bookOnWhatsApp() {
  window.open('https://wa.me/919509777684?text=Hi, I would like to book a room at Hiramani Hotel. Please share availability.', '_blank');
}

/* ============ INIT ============ */
renderCalendar();
updateSummary();