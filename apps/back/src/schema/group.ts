import { Schema } from 'mongoose';

export default new Schema({
  gid: {
    type: String,
    required: [true, 'gid can not be empty'],
  },
  group_avatar: {
    type: String,
  },
  members: {
    type: Array,
    default: [],
  },
  managers: {
    type: Array,
    default: [],
  },
});
