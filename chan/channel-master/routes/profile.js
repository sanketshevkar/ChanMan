const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const Profile = require('../models/Profile');
const User = require('../models/User').default;
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');
const jwt = require('jsonwebtoken');

//@route    GET api/route/me(user id in token)
//@desc     GET current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for the user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    Post api/route/profile
//@desc     create or update  user profile
//@access   Private

router.post(
  '/',[
    (auth,
    [
      check('hotelName', 'Room-Number is requires')
        .not()
        .isEmpty(),
      check('location', 'Number of beds is required')
        .not()
        .isEmpty(),
      check('totalRooms', 'Enter the status of the room')
        .not()
        .isEmpty()
    ])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hotelName, location, totalRooms } = req.body;

    //Build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (hotelName) profileFields.hotelName = hotelName;
    if (location) profileFields.location = location;
    if (totalRooms) profileFields.totalRooms = totalRooms;

    //Build wesite object
    /*profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;*/

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    DELETE api/route/profile
//@desc     delete profile
//@access   private

router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/route/profile/room
//@desc     add room
//@access   private

router.put(
  '/room',
  [
    auth,
    [
      check('roomNumber', 'Room-Number is requires')
        .not()
        .isEmpty(),
      check('beds', 'Number of beds is required')
        .not()
        .isEmpty(),
      check('status', 'Enter the status of the room')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomNumber, beds, status } = req.body;

    const newRoom = {
      roomNumber,
      beds,
      status
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.roomDetails.unshift(newRoom);

      await profile.save();
      //res.json(profile);

      const payload = {
        newRoom: {
          id: newRoom.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) console.error(err.message);
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    DELETE api/route/profile/room/:room_id
//@desc     delete room from profile
//@access   private
router.delete('/room/:room_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get remove index
    const removeIndex = profile.roomDetails
      .map(item => item.id)
      .indexOf(req.params.room_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/route/profile/room/:room_id
//@desc     update room from profile
//@access   private
router.post(
  '/room/:room_id',
  [
    auth,
    [
      check('roomNumber', 'Room-Number is requires')
        .not()
        .isEmpty(),
      check('beds', 'Number of beds is required')
        .not()
        .isEmpty(),
        check('status', 'Enter the status of the room')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      roomNumber,
      beds,
      status
    } = req.body;

    //Build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (roomNumber) profileFields.roomNumber = roomNumber;
    if (beds) profileFields.beds = beds;
    if (status) profileFields.status = status;

    try {
    let profile = await Profile.findOne({ user: req.user.id });

    //get update index
    const updateIndex = profile.roomDetails
      .map(item => item.id)
      .indexOf(req.params.room_id);

      console.log(updateIndex);

      profile = await Profile.findOneAndUpdate(
          { user: req.params.room_id },
          { $set: profileFields },
          { new: true }
      );

    //await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
