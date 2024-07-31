const {
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  AUTH_USER_DETAILS,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../../constants/global.constants");
const {
  EMPLOYEE,
  EMPLOYEE_PROJECT,
  PROJECT,
  TECHNOLOGY,
  LEAD,
  TASKS,
  TASK_COMMENTS,
  TEAM_MANAGMENT,
} = require("../../constants/models.enum.constants");
const {
  TEAM_MESSAGE,
} = require("../../controller-messages/teammanagment-messages/team.managment.messages");
const Employee = require("../../models/employee/employee.model");
const Team_managment = require("../../models/team_managment/team.managment.model");
const { ObjectId } = require("mongodb");

/* LIST TEAMS BY EMPLOYEE CODE// METHOD: POST // PAYLOAD : {} */
const listTeamsByEmployeeCode = async (req, res) => {
  try {

    // const { search, sort } = req.body;
    // const { employee_code } = req[AUTH_USER_DETAILS];

    // const search_by = search ? search.replace(/[^0-9a-zA-Z]/g, '\\$&') : "";
    // const sort_column = sort
    //   ? sort.column
    //     ? sort.column
    //     : "employee_code"
    //   : "employee_code";
    // const sort_column_key =
    //   sort_column === "employee_code"
    //     ? "employee_code"
    //     : sort_column === "email"
    //       ? "email"
    //       : sort_column === "fullname"
    //         ? "fullname"
    //         : "employee_code";

    // const order_by = sort.order ? sort.order : -1;

    const { teamMembers } = req[AUTH_USER_DETAILS]

    const result1 = await Employee.aggregate([
      {
        $match: {
          employee_code: { $in: teamMembers },
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: LEAD,
          let: { e_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$e_id", "$lead_assign"] },
                    { $eq: ["$is_deleted", false] },
                    { $eq: ["$is_disable", false] },
                  ],
                },
              },
            },
            {
              $project: {
                lead_code: 1,
                bid_id: 1,
                lead_date: 1,
                employee_code: 1,
                project_name: 1,
                client_name: 1,
                status: 1,
                project_count: 1,
                discription: 1,
              },
            },
          ],
          as: "leads",
        },
      },
      {
        $lookup: {
          from: EMPLOYEE_PROJECT,
          let: { employee_code: "$employee_code" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employee_code", "$$employee_code"] },
                is_deleted: false,
                is_disable: false,
              },
            },
            {
              $lookup: {
                from: PROJECT,
                let: { project_code: "$project_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$project_code", "$$project_code"] },
                      is_deleted: false,
                    },
                  },
                  {
                    $lookup: {
                      from: TECHNOLOGY,
                      let: { id: "$technology" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $in: ["$_id", "$$id"],
                            },
                          },
                        },
                        {
                          $project: {
                            _id: 0,
                            title: 1,
                          },
                        },
                      ],
                      as: "technology",
                    },
                  },
                  // {
                  //   $lookup: {
                  //     from: TASKS,
                  //     let: { p_code: "$project_code" },
                  //     pipeline: [
                  //       {
                  //         $match: {
                  //           $expr: {
                  //             $and: [
                  //               { $eq: ["$project_code", "$$p_code"] },
                  //               { $eq: ["$is_deleted", false] },
                  //               { $eq: ["$is_disabled", false] },
                  //             ],
                  //           },
                  //         },
                  //       },
                  //       {
                  //         $lookup: {
                  //           from: TASK_COMMENTS,
                  //           let: { t_id: "$_id" },
                  //           pipeline: [
                  //             {
                  //               $match: {
                  //                 $expr: {
                  //                   $and: [
                  //                     { $eq: ["$task_id", "$$t_id"] },
                  //                     { $eq: ["$is_deleted", false] },
                  //                     { $eq: ["$is_disabled", false] },
                  //                   ],
                  //                 },
                  //               },
                  //             },
                  //             {
                  //               $lookup: {
                  //                 from: EMPLOYEE,
                  //                 let: { commented_by: "$commented_by" },
                  //                 pipeline: [
                  //                   {
                  //                     $match: {
                  //                       $expr: {
                  //                         $and: [
                  //                           {
                  //                             $eq: [
                  //                               "$employee_code",
                  //                               "$$commented_by",
                  //                             ],
                  //                           },
                  //                           {
                  //                             $eq: ["$is_deleted", false],
                  //                           },
                  //                         ],
                  //                       },
                  //                     },
                  //                   },
                  //                   {
                  //                     $project: {
                  //                       _id: 0,
                  //                       commented_by: {
                  //                         $concat: [
                  //                           "$firstname",
                  //                           " ",
                  //                           "$lastname",
                  //                         ],
                  //                       },
                  //                     },
                  //                   },
                  //                 ],
                  //                 as: "commented_by",
                  //               },
                  //             },
                  //             {
                  //               $unwind: {
                  //                 path: "$commented_by",
                  //                 preserveNullAndEmptyArrays: true,
                  //               },
                  //             },
                  //             {
                  //               $project: {
                  //                 _id: 0,
                  //                 comment: 1,
                  //                 commented_by:
                  //                   "$commented_by.commented_by",
                  //                 created_date: 1,
                  //               },
                  //             },
                  //           ],
                  //           as: "task_comments",
                  //         },
                  //       },
                  //       {
                  //         $project: {
                  //           title: 1,
                  //           description: 1,
                  //           client_time: 1,
                  //           with_tracker: 1,
                  //           due_date: 1,
                  //           assigned_on: 1,
                  //           status: 1,
                  //           status_history: 1,
                  //           created_by: 1,
                  //           created_date: 1,
                  //           task_comments: 1,
                  //         },
                  //       },
                  //     ],
                  //     as: "tasks",
                  //   },
                  // },
                ],
                as: "projects",
              },
            },
            {
              $unwind: {
                path: "$projects",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                project_code: "$projects.project_code",
                project_title: "$projects.project_title",
                project_start_date: "$projects.project_start_date",
                technology: "$projects.technology.title",
                client_name: "$projects.client_name",
                estimated_hours: "$projects.estimated_hours",
                remaining_hours: "$projects.remaining_hours",
                weekly_limit_summary: "$projects.weekly_limit_summary",
                status: "$projects.status",
                nda: "$projects.nda",
                nda_status: "$projects.nda_status",
                created_by: "$projects.created_by",
                createdAt: "$projects.createdAt",
                // tasks: "$projects.tasks",
              },
            },
          ],
          as: "projects",
        },
      },
      {
        $lookup: {
          from: TEAM_MANAGMENT,
          let: { leader_code: "$employee_code" },
          pipeline: [{
            $match: { $expr: { $eq: ["$team_leader", "$$leader_code"] } }
          },
          {
            $lookup: {
              from: EMPLOYEE,
              let: { members: "$team_member" },
              pipeline: [{
                $match: { $expr: { $in: ["$employee_code", "$$members"] } }
              },],
              as: "team"
            }
          }],
          as: "team"
        }
      },
      {
        $project: {
          employee_code: 1,
          email: 1,
          fullname: { $concat: ["$firstname", " ", "$lastname"] },
          leads: 1,
          projects: 1,
          team: 1
        },
      },
      { $sort: { employee_code: 1 } },
    ])

    // const getAllTeamMemberswithdetails = async (team_leader) => {
    //   const data = await findTeamMembers(team_leader);
    //   return data;
    // };

    // const findTeamMembers = async (employeeCode) => {
    //   const employee = await Team_managment.findOne({ team_leader: employeeCode });
    //   if (!employee) {
    //     return null;
    //   }
    //   const leader = result1.filter((o) => o.employee_code === employeeCode)
    //   const leader1 = leader[0]
    //   console.log("leader", leader1);

    //   const data = {
    //     ...leader1,
    //     teamMembers: [],
    //   };

    //   if (employee.team_member && employee.team_member.length > 0) {
    //     for (const member of employee.team_member) {
    //       const teamMembers = result1.filter((o) => o.employee_code === member);
    //       if (teamMembers.length > 0) {
    //         const memberDetails = teamMembers[0];
    //         if (!memberDetails.teamMembers) {
    //           memberDetails.teamMembers = [];
    //         }
    //         const nestedTeamMembers = await findTeamMembers(member);
    //         if (nestedTeamMembers) {
    //           memberDetails.teamMembers.push(nestedTeamMembers.teamMembers);
    //         }
    //         data.teamMembers.push(memberDetails);
    //       }
    //     }
    //   }

    //   return data;
    // };

    // const z = await findTeamMembers(employee_code);



    if (result1) {
      // if (z) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_FOUND,
        data: result1,
        // data: z,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* LIST TEAMS // METHOD: POST // PAYLOAD : {} */
const listTeams = async (req, res) => {
  try {

    const { search, sort } = req.body;

    const search_by = search ? search.replace(/[^0-9a-zA-Z]/g, '\\$&') : "";
    const sort_column = sort
      ? sort.column
        ? sort.column
        : "employee_code"
      : "employee_code";
    const sort_column_key =
      sort_column === "employee_code"
        ? "employee_code"
        : sort_column === "email"
          ? "email"
          : sort_column === "fullname"
            ? "fullname"
            : "employee_code";

    const order_by = sort.order ? sort.order : 1;

    const result = await Employee.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: TEAM_MANAGMENT,
          localField: 'employee_code',
          foreignField: 'team_leader',
          as: 'leaderInfo',
        },
      },
      {
        $unwind: {
          path: "$leaderInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          employee_code: 1,
          email: 1,
          fullname: { $concat: ["$firstname", " ", "$lastname"] },
          team_member: []
        },
      },
    ]);

    const result1 = await Employee.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: TEAM_MANAGMENT,
          localField: 'employee_code',
          foreignField: 'team_leader',
          as: 'leaderInfo',
        },
      },
      {
        $unwind: "$leaderInfo"
      },
      {
        $lookup: {
          from: EMPLOYEE,
          let: { employee_code: "$leaderInfo.team_member" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$employee_code", "$$employee_code"] },
                is_deleted: false,
              },
            },
            {
              $lookup: {
                from: LEAD,
                let: { e_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ["$$e_id", "$lead_assign"] },
                          { $eq: ["$is_deleted", false] },
                          { $eq: ["$is_disable", false] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      lead_code: 1,
                      bid_id: 1,
                      lead_date: 1,
                      employee_code: 1,
                      project_name: 1,
                      client_name: 1,
                      status: 1,
                      project_count: 1,
                      discription: 1,
                    },
                  },
                ],
                as: "leads",
              },
            },
            {
              $lookup: {
                from: EMPLOYEE_PROJECT,
                let: { employee_code: "$employee_code" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$employee_code", "$$employee_code"] },
                      is_deleted: false,
                      is_disable: false,
                    },
                  },
                  {
                    $lookup: {
                      from: PROJECT,
                      let: { project_code: "$project_code" },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ["$project_code", "$$project_code"] },
                            is_deleted: false,
                          },
                        },
                        {
                          $lookup: {
                            from: TECHNOLOGY,
                            let: { id: "$technology" },
                            pipeline: [
                              {
                                $match: {
                                  $expr: {
                                    $in: ["$_id", "$$id"],
                                  },
                                },
                              },
                              {
                                $project: {
                                  _id: 0,
                                  title: 1,
                                },
                              },
                            ],
                            as: "technology",
                          },
                        },
                        {
                          $lookup: {
                            from: TASKS,
                            let: { p_code: "$project_code" },
                            pipeline: [
                              {
                                $match: {
                                  $expr: {
                                    $and: [
                                      { $eq: ["$project_code", "$$p_code"] },
                                      { $eq: ["$is_deleted", false] },
                                      { $eq: ["$is_disabled", false] },
                                    ],
                                  },
                                },
                              },
                              {
                                $lookup: {
                                  from: TASK_COMMENTS,
                                  let: { t_id: "$_id" },
                                  pipeline: [
                                    {
                                      $match: {
                                        $expr: {
                                          $and: [
                                            { $eq: ["$task_id", "$$t_id"] },
                                            { $eq: ["$is_deleted", false] },
                                            { $eq: ["$is_disabled", false] },
                                          ],
                                        },
                                      },
                                    },
                                    {
                                      $lookup: {
                                        from: EMPLOYEE,
                                        let: { commented_by: "$commented_by" },
                                        pipeline: [
                                          {
                                            $match: {
                                              $expr: {
                                                $and: [
                                                  {
                                                    $eq: [
                                                      "$employee_code",
                                                      "$$commented_by",
                                                    ],
                                                  },
                                                  {
                                                    $eq: ["$is_deleted", false],
                                                  },
                                                ],
                                              },
                                            },
                                          },
                                          {
                                            $project: {
                                              _id: 0,
                                              commented_by: {
                                                $concat: [
                                                  "$firstname",
                                                  " ",
                                                  "$lastname",
                                                ],
                                              },
                                            },
                                          },
                                        ],
                                        as: "commented_by",
                                      },
                                    },
                                    {
                                      $unwind: {
                                        path: "$commented_by",
                                        preserveNullAndEmptyArrays: true,
                                      },
                                    },
                                    {
                                      $project: {
                                        _id: 0,
                                        comment: 1,
                                        commented_by:
                                          "$commented_by.commented_by",
                                        created_date: 1,
                                      },
                                    },
                                  ],
                                  as: "task_comments",
                                },
                              },
                              {
                                $project: {
                                  title: 1,
                                  description: 1,
                                  client_time: 1,
                                  with_tracker: 1,
                                  due_date: 1,
                                  assigned_on: 1,
                                  status: 1,
                                  status_history: 1,
                                  created_by: 1,
                                  created_date: 1,
                                  task_comments: 1,
                                },
                              },
                            ],
                            as: "tasks",
                          },
                        },
                      ],
                      as: "projects",
                    },
                  },
                  {
                    $unwind: {
                      path: "$projects",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      project_code: "$projects.project_code",
                      project_title: "$projects.project_title",
                      project_start_date: "$projects.project_start_date",
                      technology: "$projects.technology.title",
                      client_name: "$projects.client_name",
                      estimated_hours: "$projects.estimated_hours",
                      remaining_hours: "$projects.remaining_hours",
                      weekly_limit_summary: "$projects.weekly_limit_summary",
                      status: "$projects.status",
                      nda: "$projects.nda",
                      nda_status: "$projects.nda_status",
                      created_by: "$projects.created_by",
                      createdAt: "$projects.createdAt",
                      tasks: "$projects.tasks",
                    },
                  },
                ],
                as: "projects",
              },
            },
            {
              $project: {
                employee_code: 1,
                email: 1,
                fullname: { $concat: ["$firstname", " ", "$lastname"] },
                leads: 1,
                projects: 1,
              },
            },
            { $sort: { employee_code: 1 } },
          ],
          as: "team_member",
        },
      },
      {
        $project: {
          employee_code: 1,
          email: 1,
          fullname: { $concat: ["$firstname", " ", "$lastname"] },
          team_member: {
            $cond: {
              if: { $eq: ["$leaderInfo", null] },
              then: [],
              else: "$team_member",
            },
          },
        },
      },
      // {
      //   $match: {
      //     $or: [
      //       { email: { $regex: `^${search_by}`, $options: "i" } },
      //       { fullname: { $regex: `^${search_by}`, $options: "i" } },
      //     ]
      //   },
      // },
      // { $sort: { [sort_column_key]: order_by } },
    ]);

    function mergeArraysByEmployeeCode(arr1, arr2) {
      return arr1.map((employee) => {
        const matchingEmployee = arr2.find((e) => e.employee_code === employee.employee_code);
        return matchingEmployee ? { ...employee, team_member: matchingEmployee.team_member } : employee;
      });
    }

    function searchEmployees(employees, searchBy) {
      const regex = new RegExp(`^${searchBy}`, "i");
      return employees.filter((employee) => {
        return regex.test(employee.email) || regex.test(employee.fullname);
      });
    }

    const mergedResult = mergeArraysByEmployeeCode(result, result1);
    const filteredEmployees = searchEmployees(mergedResult, search_by);
    const sortedArray = filteredEmployees.sort((a, b) => (a[sort_column_key] < b[sort_column_key] ? -1 : 1) * order_by);



    if (sortedArray.length) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_FOUND,
        data: sortedArray,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* ADD NEW TEAM // METHOD: POST */
/* PAYLOAD: {team_member} */
const addTeam = async (req, res) => {
  try {
    const { team_member } = req.body;
    const { employee_code } = req[AUTH_USER_DETAILS];
    const existTeam = await Team_managment.findOne({
      team_leader: employee_code,
    });

    if (existTeam) {
      const updateTeam = await Team_managment.findByIdAndUpdate(
        {
          _id: existTeam._id,
        },
        {
          team_member,
          updated_by: employee_code,
        },
        { new: true }
      );
      if (updateTeam) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TEAM_MESSAGE.TEAM_UPDATE,
          data: updateTeam,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: null,
          error: TEAM_MESSAGE.TEAM_NOT_UPDATE,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const createTeam = await Team_managment.create({
        team_leader: employee_code,
        team_member,
        created_by: employee_code,
      });
      await Employee.findOneAndUpdate(
        { employee_code: employee_code },
        { with_team: true }
      )

      if (createTeam) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: TEAM_MESSAGE.TEAM_ADDED,
          data: createTeam,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: TEAM_MESSAGE.TEAM_NOT_ADDED,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};
/* TEAM Existing check // METHOD: Get */
const teamCount = async (req, res) => {
  try {
    const { employee_code } = req[AUTH_USER_DETAILS];
    const existTeam = await Team_managment.count({
      team_leader: employee_code,
    });

    let responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
      message: null,
      data: 0,
      error: null,
    };
    if (existTeam > 0) {
      responsePayload = { ...responsePayload, data: 1 };
    }
    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* LIST One TEAM By Id in PARAMS // METHOD: GET // PARAMS: _id */
const getOneTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const _id = new ObjectId(id);
    const result = await Team_managment.findById({ _id });

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_FOUND,
        data: result,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_NOT_FOUND,
        data: {},
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

/* DELETE TEAM HARD // METHOD: DELETE // PARAMS: team_managment_id */
const deleteTeamHard = async (req, res) => {
  try {
    const { id } = req.params;

    let result = await Team_managment.findByIdAndDelete(id);

    if (result) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: TEAM_MESSAGE.TEAM_DELETED,
        data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: null,
        error: TEAM_MESSAGE.TEAM_NOT_DELETED,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    }
  } catch (error) {
    const responsePayload = {
      status: RESPONSE_PAYLOAD_STATUS_ERROR,
      message: null,
      data: null,
      error: RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    };
    return res
      .status(RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR)
      .json(responsePayload);
  }
};

module.exports = {
  addTeam,
  getOneTeam,
  deleteTeamHard,
  listTeamsByEmployeeCode,
  listTeams,
  teamCount,
};
