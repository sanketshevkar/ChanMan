const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  hotelName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  totalRooms: {
    type: String,
    required: true
  },
  
  roomDetails: [
    {
      roomNumber: {
        type: String,
        required: true
      },
      beds: {
        type: String,
        required: true
      },
      status: {
        type: String,
        required: true
      }
    }
  ]
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);