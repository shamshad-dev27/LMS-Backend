import { model, Schema } from 'mongoose'

const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'title is required'],
    minLength: [8, 'title most be 8 charactor'],
    maxLength: [59, 'title should be more than 60 character'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'description is required'],
    minLength: [8, 'description most be 8 charactor'],
    maxLength: [500, 'description should be more than 200 character'],
  },
  category: {
    type: String,
    required: [true, 'category is required'],
  },
  thumbnail: {
    public_id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    }
  },
  lectures: [{
    title: String,
    description: String,
    lecture: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      }
    },
  }],
  numberOfLecture: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    required: true,
  }
}, { timestamps: true })


const Course = model('Course', courseSchema);
export default Course;