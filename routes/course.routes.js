import { Router } from 'express'
import { AddLectureToCourseById, createCourse, getAllCourse, getLectureByCoureseId, removeCourese, removeLecture, updateCourse } from '../controllers/course.controller.js';
import { authorization, authorizeSubscriber, isLoggedIn } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
const router = Router();
router.route('/').get(getAllCourse)
    .post(isLoggedIn, authorization('ADMIN'), upload.single('thumbnail'), createCourse);
router.route('/:id').get(
    isLoggedIn,
    authorizeSubscriber,
    getLectureByCoureseId
)
    .put(
        isLoggedIn,
        authorization('ADMIN'),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorization('ADMIN'),
        removeCourese
    )
    .post(
        isLoggedIn,
        authorization('ADMIN'),
        upload.single('lecture'),
        AddLectureToCourseById
    );
router.route('/:courseId/lecture/:lectureId')
    .delete(

        isLoggedIn,
        authorization('ADMIN'),
        removeLecture
    );
export default router; 