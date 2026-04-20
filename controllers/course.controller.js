import appError from "../utils/error.utils.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';
import Course from "../models/course.modle.js";

const getAllCourse = async (req, res, next) => {
   try {
      const courses = await Course.find({}).select('-lectures');
      res.status(200).json({
         success: true,
         message: 'All courses',
         courses
      });
   } catch (e) {
      return next(new appError(e.message, 500));
   }
}

const getLectureByCoureseId = async (req, res, next) => {
   try {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) {
         return next(new appError('Invalid course id', 400));
      }
      res.status(200).json({
         success: true,
         message: 'Course lectures fetched successfully',
         lectures: course.lectures,
      });
   } catch (e) {
      return next(new appError(e.message, 500));
   }
}
const createCourse = async (req, res, next) => {
   try {
      const { title, description, category, createdBy } = req.body;

      if (!title || !description || !category || !createdBy) {
         return next(new appError('All fields are required', 400));
      }

      const course = await Course.create({
         title,
         description,
         category,
         createdBy,
         thumbnail: {
            public_id: 'default',
            secure_url: 'https://res.cloudinary.com/demo/image/upload/v12345/user.png',
         },
      });

      if (!course) {
         return next(new appError('Course could not be created, please try again', 500));
      }

      // Check if file exists
      if (req.file) {
         try {

            const result = await cloudinary.v2.uploader.upload(req.file.path, {
               folder: 'LMS',
               width: 1280,
               height: 720,
               gravity: 'auto',
               crop: 'fill',
            });

            if (result) {
               course.thumbnail.public_id = result.public_id;
               course.thumbnail.secure_url = result.secure_url;

               await course.save();
               await fs.rm(req.file.path);
            }
         } catch (error) {
            if (req.file) {
               await fs.rm(req.file.path);
            }
            return next(new appError(error.message || 'File upload failed', 500));
         }
      }

      res.status(201).json({
         success: true,
         message: 'Course created successfully',
         course
      });

   } catch (e) {
      return next(new appError(e.message, 500));
   }
}
const updateCourse = async (req, res, next) => {
   try {
      const { id } = req.params;
      const course = await Course.findByIdAndUpdate(
         id,
         { $set: req.body },
         { new: true, runValidators: true }
      );
      if (!course) {
         return next(new appError('Course with given id does not exist', 404));
      }
      res.status(200).json({
         success: true,
         message: 'Course updated successfully',
         course
      });
   } catch (e) {
      return next(new appError(e.message, 500));
   }
}

const removeCourese = async (req, res, next) => {
   try {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) {
         return next(new appError('Course with given id does not exist', 404));
      }
      await Course.findByIdAndDelete(id);
      res.status(200).json({
         success: true,
         message: 'Course deleted successfully',
      });
   } catch (e) {
      return next(new appError(e.message, 500));
   }
}

const AddLectureToCourseById = async (req, res, next) => {
   try {
      const { id } = req.params;
      const { title, description } = req.body;
      if (!title || !description) {
         return next(new appError('All fields are required', 400));
      }
      const course = await Course.findById(id);
      if (!course) {
         return next(new appError('Course with given id does not exist', 404));
      }
      const lectureData = { title, description, lecture: {} };
      if (req.file) {
         try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
               folder: 'LMS',
               resource_type: 'video',
               chunk_size: 6000000,
            });
            if (result) {
               lectureData.lecture.public_id = result.public_id;
               lectureData.lecture.secure_url = result.secure_url;
               await fs.rm(`uploads/${req.file.filename}`);
            }
         } catch (e) {
            return next(new appError(e.message, 500));
         }
      }
      course.lectures.push(lectureData);
      course.numberOfLecture = course.lectures.length;
      await course.save();
      res.status(200).json({
         success: true,
         message: 'Lecture added successfully',
         course
      });
   } catch (e) {
      return next(new appError(e.message, 500));
   }
}

const removeLecture = async (req, res, next) => {
   try {
      const { courseId, lectureId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) {
         return next(new appError('Course with given id does not exist', 404));
      }
      course.lectures = course.lectures.filter(
         (lec) => lec._id.toString() !== lectureId
      );
      course.numberOfLecture = course.lectures?.length || 0;
      await course.save();
      res.status(200).json({
         success: true,
         message: 'Lecture removed successfully'
      });
   } catch (e) {
      return next(new appError(e.message, 500));
   }
}

export { getAllCourse, getLectureByCoureseId, createCourse, updateCourse, removeCourese, AddLectureToCourseById, removeLecture };