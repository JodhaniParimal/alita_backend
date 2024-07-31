const {
    RESPONSE_PAYLOAD_STATUS_SUCCESS,
    RESPONSE_STATUS_CODE_OK,
    RESPONSE_PAYLOAD_STATUS_ERROR,
    RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
    RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
    AUTH_USER_DETAILS
} = require("../../constants/global.constants");
const { HOLIDAY_MESSAGE } = require("../../controller-messages/holiday-messages/holiday.messages");
const Holiday = require("../../models/holiday/holiday.model");


/* ADD NEW HOLIDAY // METHOD: POST */
/* PAYLOAD: { title , holiday_date} */
const addHoliday = async (req, res) => {
    try {
        const { title, holiday_date } = req.body;
        const ExistHoliday = await Holiday.findOne({
            title: { $regex: `^${title}$`, $options: "i" },
            is_deleted: false,
        });
        if (ExistHoliday) {
            const existingHolidayYear = new Date(
                ExistHoliday.holiday_date.split("-").reverse().join("-")
            ).getFullYear();
            const newHolidayYear = new Date(
                holiday_date.split("-").reverse().join("-")
            ).getFullYear();
            if (existingHolidayYear === newHolidayYear) {
                const responsePayload = {
                    status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                    message: HOLIDAY_MESSAGE.HOLIDAY_EXIST_IN_YEAR,
                    data: null,
                    error: null,
                };
                return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
            }
            else {

                const holiday = await Holiday.create({
                    title,
                    holiday_date,
                });
                if (holiday) {
                    const responsePayload = {
                        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                        message: HOLIDAY_MESSAGE.HOLIDAY_ADDED,
                        data: holiday,
                        error: null,
                    };
                    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
                } else {
                    const responsePayload = {
                        status: RESPONSE_PAYLOAD_STATUS_ERROR,
                        message: null,
                        data: {},
                        error: HOLIDAY_MESSAGE.HOLIDAY_NOT_ADDED,
                    };
                    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
                }
            }
        } else {

            const holiday = await Holiday.create({
                title,
                holiday_date,
            });
            if (holiday) {
                const responsePayload = {
                    status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                    message: HOLIDAY_MESSAGE.HOLIDAY_ADDED,
                    data: holiday,
                    error: null,
                };
                return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
            } else {
                const responsePayload = {
                    status: RESPONSE_PAYLOAD_STATUS_ERROR,
                    message: null,
                    data: {},
                    error: HOLIDAY_MESSAGE.HOLIDAY_NOT_ADDED,
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

/* UPDATE HOLIDAY // METHOD: PUT // PARAMS: _id */
/* PAYLOAD: { title , holiday_date } */
const updateHoliday = async (req, res) => {
    try {
        const { _id } = req.params;
        const { title, holiday_date } = req.body;
        const ExistHoliday = await Holiday.findOne({
            title: { $regex: `^${title}$`, $options: "i" },
            is_deleted: false,
        });
        if (ExistHoliday) {
            const existingHolidayYear = new Date(
                ExistHoliday.holiday_date.split("-").reverse().join("-")
            ).getFullYear();
            const newHolidayYear = new Date(
                holiday_date.split("-").reverse().join("-")
            ).getFullYear();
            if (existingHolidayYear === newHolidayYear) {
                const responsePayload = {
                    status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                    message: HOLIDAY_MESSAGE.HOLIDAY_EXIST_IN_YEAR,
                    data: null,
                    error: null,
                };
                return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
            }
            else {

                const holiday = await Holiday.findByIdAndUpdate(_id, {
                    title,
                    holiday_date,
                });
                if (holiday) {
                    const responsePayload = {
                        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                        message: HOLIDAY_MESSAGE.HOLIDAY_UPDATE,
                        data: holiday,
                        error: null,
                    };
                    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
                } else {
                    const responsePayload = {
                        status: RESPONSE_PAYLOAD_STATUS_ERROR,
                        message: null,
                        data: {},
                        error: HOLIDAY_MESSAGE.HOLIDAY_NOT_UPDATE,
                    };
                    return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
                }
            }
        } else {

            const holiday = await Holiday.findByIdAndUpdate(_id, {
                title,
                holiday_date,
            });
            if (holiday) {
                const responsePayload = {
                    status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                    message: HOLIDAY_MESSAGE.HOLIDAY_UPDATE,
                    data: holiday,
                    error: null,
                };
                return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
            } else {
                const responsePayload = {
                    status: RESPONSE_PAYLOAD_STATUS_ERROR,
                    message: null,
                    data: {},
                    error: HOLIDAY_MESSAGE.HOLIDAY_NOT_UPDATE,
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

/* GET HOLIDAY BY // METHOD: GET // PARAMS: _id */
const getHolidayById = async (req, res) => {
    try {
        const { _id } = req.params;
        let result = await Holiday.findById(_id)

        if (result) {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_FOUND,
                data: result,
                error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
        } else {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_NOT_FOUND,
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

/* LIST HOLIDAY // METHOD: POST // PAYLOAD: search, sort, current_page, per_page */
const listHoliday = async (req, res) => {
    try {
        const { search, sort, current_page, per_page } = req.body;
        const current_page_f = current_page ? current_page : 1;
        const per_page_f = per_page ? per_page : 25;
        const currentDate = new Date();
        const year = currentDate.getFullYear();

        const search_by = search ? search : year;

        const order_by = sort.order ? sort.order : -1;

        let matchObj = {
            is_deleted: false,
        };

        if (search_by !== "") {
            matchObj = {
                ...matchObj,
                $or: [
                    { holiday_date: { $regex: `${search_by}`, $options: "i" } },
                    // { title: { $regex: `^${search_by}`, $options: "i" } },
                ],
            };
        }

        const listHoliday = await Holiday.aggregate([
            {
                $match: matchObj
            },
            {
                $addFields: {
                    parsedDate: {
                        $dateFromString: {
                            dateString: "$holiday_date",
                            format: "%d-%m-%Y"
                        }
                    }
                }
            },
            { $sort: { parsedDate: order_by } },
            { $project: { parsedDate: 0 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: (current_page_f - 1) * per_page_f },
                        { $limit: per_page_f },
                    ],
                },
            },
            {
                $addFields: {
                    total: { $arrayElemAt: ["$metadata.total", 0] },
                    current_page: current_page_f,
                    per_page: per_page_f,
                },
            },
            {
                $project: {
                    data: 1,
                    metaData: {
                        per_page: "$per_page",
                        total_page: { $ceil: { $divide: ["$total", per_page_f] } },
                        current_page: "$current_page",
                        total_count: "$total",
                    },
                },
            },
        ]);

        if (listHoliday) {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_FOUND,
                data: listHoliday[0],
                error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
        } else {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_NOT_UPDATE,
                data: [],
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

/* LIST HOLIDAY // METHOD: GET*/
const listHolidayDate = async (req, res) => {
    try {
        const holidayDate = await Holiday.find({ is_deleted: false }).select({ holiday_date: 1 })

        if (holidayDate) {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_FOUND,
                data: holidayDate,
                error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
        } else {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_NOT_UPDATE,
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

/* DELETE Holiday // METHOD: DELETE // PARAMS: _id */
const deleteHoliday = async (req, res) => {
    try {
        const { _id } = req.params;
        const { employee_code } = req[AUTH_USER_DETAILS];

        let result = await Holiday.findByIdAndUpdate({ _id }, {
            is_deleted: true,
            deleted_by: employee_code,
        });

        if (result) {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
                message: HOLIDAY_MESSAGE.HOLIDAY_DELETED,
                data: null,
                error: null,
            };
            return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
        } else {
            const responsePayload = {
                status: RESPONSE_PAYLOAD_STATUS_ERROR,
                message: null,
                data: null,
                error: HOLIDAY_MESSAGE.HOLIDAY_NOT_DELETED,
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
    addHoliday,
    deleteHoliday,
    updateHoliday,
    getHolidayById,
    listHoliday,
    listHolidayDate
};
