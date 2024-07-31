const EMPLOYEE_STATUS = {
  STATUS_ACTIVE: "active",
  STATUS_RESIGNED: "resigned",
  STATUS_NOTICEPERIOD: "notice-period",
  STATUS_FIRED: "fired",
};

const ROLES = {
  CEO: "ceo",
  CTO: "cto",
  HR: "hr",
  TL: "tl",
  JUNIOR_DEVELOPER: "junior_developer",
  SENIOR_DEVELOPER: "senior_developer",
};

const LEAD_STATUS = {
  LEAD_STATUS_OPEN: "open",
  LEAD_STATUS_HIRED: "hired",
  LEAD_STATUS_FOLLOW_UP: "follow-up",
  LEAD_STATUS_REJECTED: "rejected",
};

const PROJECT_STATUS = {
  PROJECT_STATUS_WORKING: "working",
  PROJECT_STATUS_HOLD: "hold",
  PROJECT_STATUS_COMPLETED: "completed",
};

const NDA_STATUS = {
  NDA_STATUS_HOURLY: "hourly",
  NDA_STATUS_FIXED: "fixed",
};

const JOB_TYPE = {
  JOB_TYPE_HOURLY: "hourly",
  JOB_TYPE_MONTHLY: "monthly",
  JOB_TYPE_WEEKLY: "weekly",
  JOB_TYPE_FIXED: "fixed",
};

const VALIDATION_TYPE = {
  UNIQUE: "unique",
  EXISTS: "exists",
};

const PERMISSION_TYPE = {
  EMPLOYEE_VIEW: "employee-view",
  EMPLOYEE_ADD: "employee-add",
  EMPLOYEE_UPDATE: "employee-update",
  EMPLOYEE_DELETE: "employee-delete",
  ROLE_VIEW: "role-view",
  ROLE_ADD: "role-add",
  ROLE_UPDATE: "role-update",
  ROLE_DELETE: "role-delete",
  GROUP_VIEW: "group-view",
  GROUP_ADD: "group-add",
  GROUP_UPDATE: "group-update",
  GROUP_DELETE: "group-delete",
  BID_VIEW: "bid-view",
  BID_ADD: "bid-add",
  BID_UPDATE: "bid-update",
  BID_DELETE: "bid-delete",
  LEAD_VIEW: "lead-view",
  LEAD_ADD: "lead-add",
  LEAD_UPDATE: "lead-update",
  LEAD_DELETE: "lead-delete",
  PROJECT_VIEW: "project-view",
  PROJECT_ADD: "project-add",
  PROJECT_UPDATE: "project-update",
  PROJECT_DELETE: "project-delete",
  TRACKER_EMPLOYEE_VIEW: "tracker-employee-view",
  TRACKER_EMPLOYEE_UPDATE:"tracker-employee-update",
  TRACKER_EMPLOYEE_DELETE:"tracker-employee-delete",
  TASK_VIEW: "task-view",
  TASK_ADD: "task-add",
  TASK_UPDATE: "task-update",
  TASK_DELETE: "task-delete",
  TASK_EMPLOYEE_ADD: "task-employee-add",
  TASK_COMMENT_VIEW: "task-comment-view",
  TASK_COMMENT_ADD: "task-comment-add",
  TASK_COMMENT_UPDATE: "task-comment-update",
  TASK_COMMENT_DELETE: "task-comment-delete",
  TECHNOLOGY_VIEW: "technology-view",
  TECHNOLOGY_ADD: "technology-add",
  TECHNOLOGY_UPDATE: "technology-update",
  TECHNOLOGY_DELETE: "technology-delete",
  DEPARTMENT_VIEW: "department-view",
  DEPARTMENT_ADD: "department-add",
  DEPARTMENT_UPDATE: "department-update",
  DEPARTMENT_DELETE: "department-delete",
  TECH_SUPPORT_VIEW: "tech-support-view",
  TECH_SUPPORT_EMPLOYEE_VIEW: "tech-support-employee-view",
  TECH_SUPPORT_ADD: "tech-support-add",
  TECH_SUPPORT_EMPLOYEE_UPDATE: "tech-support-employee-update",
  TECH_SUPPORT_UPDATE: "tech-support-update",
  TECH_SUPPORT_DELETE: "tech-support-delete",
  EMPLOYEE_PROJECT_VIEW: "employee-project-view",
  EMPLOYEE_PROJECT_ADD: "employee-project-add",
  EMPLOYEE_PROJECT_UPDATE: "employee-project-update",
  EMPLOYEE_PROJECT_DELETE: "employee-project-delete",
  EMPLOYEE_LEAD_VIEW: "employee-lead-view",
  EMPLOYEE_LEAD_ADD: "employee-lead-add",
  EMPLOYEE_LEAD_UPDATE: "employee-lead-update",
  EMPLOYEE_LEAD_DELETE: "employee-lead-delete",
  PERMISSION_VIEW: "permission-view",
  PERMISSION_UPDATE: "permission-update",
  EMPLOYEE_GROUP_VIEW: "employee-group-view",
  EMPLOYEE_GROUP_UPDATE: "employee-group-update",
  MASTER_PASSWORD_EDIT: "master-password-edit",
  SNACKS_CATEGORY_VIEW: "snacks-category-view",
  SNACKS_CATEGORY_ADD: "snacks-category-add",
  SNACKS_CATEGORY_UPDATE: "snacks-category-update",
  SNACKS_CATEGORY_DELETE: "snacks-category-delete",
  SNACKS_ITEMS_VIEW: "snacks-items-view",
  SNACKS_ITEMS_ADD: "snacks-items-add",
  SNACKS_ITEMS_UPDATE: "snacks-items-update",
  SNACKS_ITEMS_DELETE: "snacks-items-delete",
  SNACKS_REPORT_VIEW: "snacks-report-view",
  SNACKS_REPORT_DOWNLOAD: "snacks-report-download",
  HOLIDAY_VIEW: "holiday-view",
  HOLIDAY_ADD: "holiday-add",
  HOLIDAY_UPDATE: "holiday-update",
  HOLIDAY_DELETE: "holiday-delete",
  CLIENT_VIEW: "client-view",
  CLIENT_ADD: "client-add",
  CLIENT_UPDATE: "client-update",
  CLIENT_DELETE: "client-delete",
  TEAM_VIEW: "team-view",
  TEAM_ADD: "team-add",
  TEAM_UPDATE: "team-update",
  TEAM_DELETE: "team-delete",
  ALL_LEAVE:"all-leave",
  LEAVE_VIEW: "leave-view",
  LEAVE_EMPLOYEE_VIEW: "leave-employee-view",
  LEAVE_ADD: "leave-add",
  LEAVE_EMPLOYEE_UPDATE: "leave-employee-update",
  LEAVE_UPDATE: "leave-update",
  LEAVE_DELETE: "leave-delete",
};

const TASK_STATUS = {
  TODO: "To Do",
  IN_PROGRESS: "In-progress",
  READY_TO_QA: "Ready to QA",
  DONE: "Done",
};

const LEAVE_CATEGORY = {
  FULL: "full",
  PRELUNCH: "prelunch",
  POSTLUNCH: "postlunch",
  SHORT: "short",
};

const WITH_PROJECT_OR_NOT = {
  WITHOUT_PROJECT: "without_project",
  WITH_PROJECT: "with_project"
}

const LEAVE_STATUS = {
  APPROVE: "approve",
  REJECTED: "rejected",
  PENDING: "pending",
  UNAPPROVE: "unapproved",
};

const TICKET_STATUS = {
  TICKET_STATUS_OPEN: "open",
  TICKET_STATUS_COLSE: "close",
};

const ORDER_STATUS = {
  ORDER_SUCCESS: "success",
  ORDER_PENDING: "pending",
  ORDER_REJECTED: "rejected",
  ORDER_FAILED: "failed",
};

const ENUMS = {
  EMPLOYEE_STATUS,
  ROLES,
  VALIDATION_TYPE,
  LEAD_STATUS,
  PROJECT_STATUS,
  NDA_STATUS,
  JOB_TYPE,
  PERMISSION_TYPE,
  TASK_STATUS,
  TICKET_STATUS,
  ORDER_STATUS,
  LEAVE_CATEGORY,
  LEAVE_STATUS,
  WITH_PROJECT_OR_NOT
};

module.exports = { ENUMS };
