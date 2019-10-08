const users = [];

// add user,remove user,get user, get users in room

const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room required'
    };
  }

  //   Check for existing user
  const existUser = users.find(user => {
    return user.room === room && user.username === username;
  });
  if (existUser) {
    return {
      error: 'Username is in use'
    };
  }

  //   store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// get user
const getUser = id => {
  const u = users.find(user => {
    return user.id === id;
  });
  if (u) {
    return u;
  } else {
    return {
      error: 'User doesnt exist'
    };
  }
};

// Get users in room
const getUserInRoom = room => {
  const inRoom = users.filter(user => {
    return user.room === room;
  });

  if (inRoom.length === 0) {
    return {
      error: 'No users in room'
    };
  }
  return inRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
};
