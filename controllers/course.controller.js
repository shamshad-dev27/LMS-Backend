
import appError from "../utils/error.utils.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary'
import Course from "../models/course.modle.js";
const getAllCourse = async (req, res, next) => {
   try {
      const courses = await Course.find({}).select('-lectures');

      res.status(200).json({
         success: true,
         message: 'All course',
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
         return next(new appError('Invalid course id'), 400);
      }
      res.status(200).json({
         success: true,
         message: 'Course lecture fatch successfully',
         course,
         lecture: course.lectures,
      })
   } catch (e) {
      return next(new appError(e.message), 500);
   }
}
const createCourse = async (req, res, next) => {
   const { title, description, category, createdBy } = req.body;
   if (!title || !description || !category || !createdBy) {
      return next(new appError('All field is required', 500));
   }
   const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
         public_id: 'default',
         secure_url: "https://res.cloudinary.com/demo/image/upload/v12345/user.png",
      }
   });
   if (!course) {
      return next(new appError('Course could not be created, Please try again', 500));
   }
   if (req.file) {
      try {
         const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'LMS',
            width: 1280,
            height: 720,
            gravity: 'auto',
            crop: 'fill'
         });
         if (result) {
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
            // Remove file from server
            await fs.rm(`uploads/${req.file.filename}`);
            await course.save();

         }

         res.status(200).json({
            success: true,
            message: 'course is creaete successfully',
            course
         })
      } catch (e) {
         return next(new appError(e.message, 500));
      }
   }

}
const updateCourse = async (req, res, next) => {
   try {
      const { id } = req.params;
      const course = await Course.findByIdAndUpdate(
         id,
         {
            $set: req.body
         }, {
         new: true,
         runValidators: true
      }
      );
      if (!course) {
         return (new appError('Coures with give id do not exist', 500));
      }
      await course.save();
      res.status(200).json({
         success: true,
         message: 'Course update successfully',
         course
      })
   } catch (e) {
      return (new appError(e.message, 500));
   }
}
const removeCourese = async (req, res, next) => {
   try {
      const { id } = req.params;
      const coures = await Course.findById(id);
      if (!coures) {
         return (new appError('Coures with give id do not exist', 500));
      }

      await Course.findByIdAndDelete(id);

      res.status(200).json({
         success: true,
         message: 'Course delete successfully',
      })
   } catch (e) {
      return (new appError(e.message, 500));
   }
}
const AddLectureToCourseById = async (req, res, next) => {
   const { id } = req.params;
   const { title, description } = req.body;
   if (!title || !description) {
      return next(new appError('All field is required', 400));
   }
   const course = await Course.findById(id);
   if (!course) {
      return next(new appError('Coures with give id do not exist', 500));
   }
   const lectureData = {
      title,
      description,
      lecture: {}
   }

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
            // Remove file from server
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
      message: 'lecture add successfully in course',
      course
   })
}
const removeLecture = async (req, res, next) => {
   const { courseId, lectureId } = req.params;
   const course = await Course.findById(courseId);
   if (!course) {
      return next(new appError('Coures with give id do not exist', 500));
   }
   course.lectures = course.lectures.filter(
      (lec) => lec._id.toString() !== lectureId
   );
   course.numberOfLecture = course.lectures?.length || 0;

   await course.save();

   res.status(200).json({
      success: true,
      message: 'Lecture is remove successfully'
   })
}
export { getAllCourse, getLectureByCoureseId, createCourse, updateCourse, removeCourese, AddLectureToCourseById, removeLecture }