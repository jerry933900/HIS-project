const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const userController = require('../../controllers/userController');
const patientController = require('../../controllers/patientController');
const departmentController = require('../../controllers/departmentController');
const registrationController = require('../../controllers/registrationController');
const medicalRecordController = require('../../controllers/medicalRecordController');
const medicineController = require('../../controllers/medicineController');
const prescriptionController = require('../../controllers/prescriptionController');
const examItemController = require('../../controllers/examItemController');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

/**
 * 认证相关路由 - 无需认证
 */
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/logout', authMiddleware, authController.logout);

/**
 * 用户相关路由 - 需要认证
 */
router.get('/auth/me', authMiddleware, authController.getCurrentUser);
router.put('/auth/me', authMiddleware, authController.updateCurrentUser);
router.put('/auth/password', authMiddleware, authController.changePassword);

/**
 * 用户管理路由 - 需要管理员权限
 */
router.get('/users', authMiddleware, roleMiddleware(['admin']), userController.getUsers);
router.get('/users/:id', authMiddleware, roleMiddleware(['admin', 'doctor']), userController.getUserById);
router.post('/users', authMiddleware, roleMiddleware(['admin']), userController.createUser);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);
router.put('/users/:id/status', authMiddleware, roleMiddleware(['admin']), userController.updateUserStatus);
router.put('/users/:id/reset-password', authMiddleware, roleMiddleware(['admin']), userController.resetPassword);
router.delete('/users/batch', authMiddleware, roleMiddleware(['admin']), userController.batchDeleteUsers);
router.get('/users/statistics', authMiddleware, roleMiddleware(['admin']), userController.getUserStatistics);

/**
 * 患者相关路由
 */
router.get('/patients', authMiddleware, patientController.getPatients);
router.get('/patients/:id', authMiddleware, patientController.getPatientById);
router.post('/patients', authMiddleware, patientController.createPatient);
router.put('/patients/:id', authMiddleware, patientController.updatePatient);
router.delete('/patients/:id', authMiddleware, roleMiddleware(['admin']), patientController.deletePatient);
router.get('/patients/:id/registrations', authMiddleware, patientController.getPatientRegistrations);
router.get('/patients/:id/medical-records', authMiddleware, patientController.getPatientMedicalRecords);
router.get('/patients/:id/prescriptions', authMiddleware, patientController.getPatientPrescriptions);
router.get('/patients/statistics', authMiddleware, patientController.getPatientStatistics);

/**
 * 科室相关路由
 */
router.get('/departments', authMiddleware, departmentController.getDepartments);
router.get('/departments/:id', authMiddleware, departmentController.getDepartmentById);
router.post('/departments', authMiddleware, roleMiddleware(['admin']), departmentController.createDepartment);
router.put('/departments/:id', authMiddleware, roleMiddleware(['admin']), departmentController.updateDepartment);
router.delete('/departments/:id', authMiddleware, roleMiddleware(['admin']), departmentController.deleteDepartment);
router.get('/departments/:id/doctors', authMiddleware, departmentController.getDepartmentDoctors);
router.get('/departments/tree', authMiddleware, departmentController.getDepartmentTree);
// router.get('/departments/statistics', authMiddleware, departmentController.getDepartmentStatistics); // 暂时注释，后续修复
// router.get('/departments/:id/children', authMiddleware, departmentController.getDepartmentChildren); // 暂时注释，后续修复

/**
 * 挂号相关路由
 */
router.get('/registrations', authMiddleware, registrationController.getRegistrations);
router.get('/registrations/:id', authMiddleware, registrationController.getRegistrationById);
router.post('/registrations', authMiddleware, registrationController.createRegistration);
router.put('/registrations/:id', authMiddleware, registrationController.updateRegistration);
// router.delete('/registrations/:id', authMiddleware, roleMiddleware(['admin']), registrationController.deleteRegistration); // 暂时注释，后续修复
// router.put('/registrations/:id/check-in', authMiddleware, registrationController.checkIn); // 暂时注释，后续修复
router.put('/registrations/:id/cancel', authMiddleware, registrationController.cancelRegistration);
router.get('/registrations/doctor/schedule', authMiddleware, registrationController.getDoctorSchedule);
// router.get('/registrations/statistics', authMiddleware, registrationController.getRegistrationStatistics); // 暂时注释，解决路由错误
// router.get('/registrations/patient/:patientId', authMiddleware, registrationController.getPatientRegistrations); // 暂时注释，方法未定义

/**
 * 病历相关路由
 */
router.get('/medical-records', authMiddleware, roleMiddleware(['admin', 'doctor']), medicalRecordController.getMedicalRecords);
router.get('/medical-records/:id', authMiddleware, medicalRecordController.getMedicalRecordById);
router.post('/medical-records', authMiddleware, roleMiddleware(['doctor']), medicalRecordController.createMedicalRecord);
router.put('/medical-records/:id', authMiddleware, roleMiddleware(['doctor']), medicalRecordController.updateMedicalRecord);
router.put('/medical-records/:id/archive', authMiddleware, roleMiddleware(['doctor']), medicalRecordController.archiveMedicalRecord);
router.get('/medical-records/patient/:patientId', authMiddleware, medicalRecordController.getPatientMedicalHistory);
router.get('/medical-records/statistics', authMiddleware, roleMiddleware(['admin']), medicalRecordController.getMedicalRecordStatistics);

/**
 * 药品相关路由
 */
router.get('/medicines', authMiddleware, medicineController.getMedicines);
router.get('/medicines/:id', authMiddleware, medicineController.getMedicineById);
router.post('/medicines', authMiddleware, roleMiddleware(['admin', 'pharmacist']), medicineController.createMedicine);
router.put('/medicines/:id', authMiddleware, roleMiddleware(['admin', 'pharmacist']), medicineController.updateMedicine);
router.delete('/medicines/:id', authMiddleware, roleMiddleware(['admin']), medicineController.deleteMedicine);
router.put('/medicines/:id/status', authMiddleware, roleMiddleware(['admin', 'pharmacist']), medicineController.updateMedicine);
router.put('/medicines/:id/stock', authMiddleware, roleMiddleware(['pharmacist']), medicineController.updateMedicineStock);
router.get('/medicines/stock/alerts', authMiddleware, roleMiddleware(['admin', 'pharmacist']), medicineController.getStockAlerts);
router.get('/medicines/stock/history', authMiddleware, roleMiddleware(['admin', 'pharmacist']), medicineController.getMedicineStockHistory);
router.get('/medicines/statistics', authMiddleware, medicineController.getMedicineStatistics);
// router.delete('/medicines/batch', authMiddleware, roleMiddleware(['admin']), medicineController.batchDeleteMedicines); // 暂时注释，方法未定义

/**
 * 处方相关路由
 */
router.get('/prescriptions', authMiddleware, prescriptionController.getPrescriptions);
router.get('/prescriptions/:id', authMiddleware, prescriptionController.getPrescriptionById);
router.post('/prescriptions', authMiddleware, roleMiddleware(['doctor']), prescriptionController.createPrescription);
router.put('/prescriptions/:id/confirm', authMiddleware, roleMiddleware(['pharmacist']), prescriptionController.confirmPrescription);
router.put('/prescriptions/:id/cancel', authMiddleware, prescriptionController.cancelPrescription);
router.get('/prescriptions/patient/:patientId', authMiddleware, prescriptionController.getPatientPrescriptionHistory);
router.get('/prescriptions/statistics', authMiddleware, roleMiddleware(['admin']), prescriptionController.getPrescriptionStatistics);

/**
 * 检查项目相关路由
 */
router.get('/exam-items', authMiddleware, examItemController.getExamItems);
router.get('/exam-items/:id', authMiddleware, examItemController.getExamItemById);
router.post('/exam-items', authMiddleware, roleMiddleware(['admin']), examItemController.createExamItem);
router.put('/exam-items/:id', authMiddleware, roleMiddleware(['admin']), examItemController.updateExamItem);
router.delete('/exam-items/:id', authMiddleware, roleMiddleware(['admin']), examItemController.deleteExamItem);
router.delete('/exam-items/batch', authMiddleware, roleMiddleware(['admin']), examItemController.batchDeleteExamItems);
router.put('/exam-items/:id/status', authMiddleware, roleMiddleware(['admin']), examItemController.updateExamItemStatus);
router.get('/exam-items/categories', authMiddleware, examItemController.getExamItemCategories);
router.get('/exam-items/search', authMiddleware, examItemController.searchExamItems);
router.get('/exam-items/statistics', authMiddleware, examItemController.getExamItemStatistics);

module.exports = router;