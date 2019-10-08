const socket = io();

// Html elements
const button = document.querySelector('#inc');
const form = document.querySelector('#form');
const msg = document.querySelector('#msg');
const locationBtn = document.querySelector('#location');
const messages = document.querySelector('#messages');
const showRoom = document.querySelector('#showRoom');
const sidebar = document.querySelector('#sidebar');
// Templates
const msgTemp = document.querySelector('#message-temp').innerHTML;
const locationTemp = document.querySelector('#location-temp').innerHTML;
const sidebarTemp = document.querySelector('#sidebar-temp').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
// autoscroll
const autoscroll = () => {
  const newMessage = messages.lastElementChild;

  const newMessageStyle = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const contHeight = messages.scrollHeight;

  const scrollOff = messages.scrollTop + visibleHeight;

  if (contHeight - newMessageHeight <= scrollOff) {
    messages.scrollTop = messages.scrollHeight;
  }
};
// Event listners
form.addEventListener('submit', e => {
  e.preventDefault();

  button.setAttribute('disabled', 'disabled');

  socket.emit('message', msg.value, error => {
    button.removeAttribute('disabled');
    msg.value = '';
    msg.focus();
    if (error) {
      return console.log('No profanity');
    }
    console.log('Message recieved');
  });
});
locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolcation is not supported');
  }
  locationBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    const { coords } = position;
    socket.emit(
      'sendLocation',
      {
        lat: coords.latitude,
        long: coords.longitude
      },
      msg => {
        locationBtn.removeAttribute('disabled');

        console.log(msg);
      }
    );
  });
});
showRoom.addEventListener('click', () => {
  sidebar.classList.toggle('none');
});
// Socket events
socket.on('welcome', msg => {
  const html = Mustache.render(msgTemp, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
socket.on('locationMessage', url => {
  const html = Mustache.render(locationTemp, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemp, {
    room,
    users
  });

  document.querySelector('#sidebar').innerHTML = html;
});
