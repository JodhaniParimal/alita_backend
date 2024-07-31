const express = require("express");
const { auth } = require("../../middlewares/auth.guard");
const {
  loggedInUserDetails,
  loggedInUserOfficeDetails,
  loggedInUserDocument,
  loggedInUserFamilyDetails,
  loggedInUserContactDetails,
  loggedInUserSkillRating,
  loggedInUserAdditionalInfo,
  logInUserPasswordChange,
} = require("../../controllers/auth/profile/loggedinUser.controller");

const {
  profilePicUpload,
  uploadDocuments,
} = require("../../services/fileUpload");
const {
  updateEmployee,
} = require("../../controllers/employee/employee.controller");
const {
  saveEmployeeOfficeDetails, updateOnePastCompny, deleteOnePastCompny, deleteShiftTimeByID,
} = require("../../controllers/employee/employee.office.details.controller");
const {
  saveEmployeeFamilyDetails, updateOneFamilyDetail, deleteOneDetail,
} = require("../../controllers/employee/employee.family.details.controller");
const {
  saveEmployeeContactDetails, updateEmergencyNumbers, deleteEmergencyNumbers,
} = require("../../controllers/employee/employee.contact.details.controller");
const {
  saveEmployeeDocument, deleteOneFileById,
} = require("../../controllers/employee/employee.documents.controller");
const { addupdateAdditionalinfo } = require("../../controllers/behaviouralSkillset/employee.additional.info.controller");
const { addEmployeeSkillRating, updateEmployeeSkillRating, deleteEmployeeSkillRating } = require("../../controllers/behaviouralSkillset/employee.skill.ratings.controller");

const profileRouter = new express.Router();

profileRouter.get("/", auth, loggedInUserDetails);
profileRouter.get("/office", auth, loggedInUserOfficeDetails);
profileRouter.get("/document", auth, loggedInUserDocument);
profileRouter.get("/family", auth, loggedInUserFamilyDetails);
profileRouter.get("/contact", auth, loggedInUserContactDetails);
profileRouter.get("/skill", auth, loggedInUserSkillRating);
profileRouter.get("/other", auth, loggedInUserAdditionalInfo);
profileRouter.put("/change-password", auth, logInUserPasswordChange);


profileRouter.put(
  "/edit-profile",
  auth,
  profilePicUpload.single("file"),
  updateEmployee
);

profileRouter.put("/edit-contact-details", auth, saveEmployeeContactDetails);
profileRouter.put("/edit-family-details", auth, saveEmployeeFamilyDetails);
profileRouter.put("/edit-office-details", auth, saveEmployeeOfficeDetails);

profileRouter.put(
  "/edit-document",
  auth,
  uploadDocuments.array("files"),
  saveEmployeeDocument
);

profileRouter.put("/edit-additional-info", auth, addupdateAdditionalinfo);
profileRouter.put("/add-skill-rating", auth, addEmployeeSkillRating);

profileRouter.put("/update-rating/:_id", auth, updateEmployeeSkillRating);
profileRouter.put("/update-e-number/:id/:emeNumId", auth, updateEmergencyNumbers);
profileRouter.put("/update-one-family/:id/:detailId", auth, updateOneFamilyDetail);
profileRouter.put("/update-past-compny/:id/:pastCompanyId", auth, updateOnePastCompny);

profileRouter.delete("/delete-skill-rating/:_id", auth, deleteEmployeeSkillRating);
profileRouter.delete("/delete-e-number/:id/:emeNumId", auth, deleteEmergencyNumbers);
profileRouter.delete("/delete-one-family/:id/:detailId", auth, deleteOneDetail);
profileRouter.delete("/delete-past-compny/:id/:pastCompanyId", auth, deleteOnePastCompny);
profileRouter.delete("/delete-shift-time/:id/:shift_id", auth, deleteShiftTimeByID);
profileRouter.delete("/delete-doc-file/:id/:fileId", auth, deleteOneFileById);


module.exports = { profileRouter };
