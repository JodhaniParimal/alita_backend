const {
  RESPONSE_PAYLOAD_STATUS_ERROR,
  RESPONSE_STATUS_MESSAGE_INTERNAL_SERVER_ERROR,
  RESPONSE_STATUS_CODE_INTERNAL_SERVER_ERROR,
  RESPONSE_PAYLOAD_STATUS_SUCCESS,
  RESPONSE_STATUS_CODE_OK,
} = require("../../constants/global.constants");
const Working_date = require("../../models/working_date/working_date.model");

/* ADD NEW WORKING_DATE // METHOD: POST */
/* PAYLOAD: { working_date ,time } */
const addWorkingDay = async (req, res) => {
  try {
    const { working_date, time } = req.body;
    const startDate = new Date(working_date);
    startDate.setHours(5, 30, 0, 0);

    const endDate = new Date(working_date);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(5, 29, 0, 0);

    const ExistWorking = await Working_date.findOne({
      working_date: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
      is_deleted: false,
    });
    if (ExistWorking) {
      const UpdateWorking = await Working_date.findOneAndUpdate(
        {
          working_date: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
          is_deleted: false,
        },
        {
          daily_time: time,
        },
        { new: true }
      );
      if (UpdateWorking) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: "Working date saved successfully",
          data: UpdateWorking,
          // data: null,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: "Working date not saved",
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      }
    } else {
      const NewWorking = await Working_date.create({
        working_date,
        daily_time: time,
      });
      if (NewWorking) {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
          message: "Working date saved successfully",
          data: NewWorking,
          error: null,
        };
        return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
      } else {
        const responsePayload = {
          status: RESPONSE_PAYLOAD_STATUS_ERROR,
          message: null,
          data: {},
          error: "Working date not saved",
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

/* UPDATE/DISABLE WORKING_DATE // METHOD: PUT */
/* PAYLOAD: { working_date } */
const disableWorkingDay = async (req, res) => {
  try {
    const { working_date } = req.body;
    const startDate = new Date(working_date);
    startDate.setHours(5, 30, 0, 0);

    const endDate = new Date(working_date);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(5, 29, 0, 0);

    const DisableWorking = await Working_date.findOneAndUpdate(
      {
        working_date: {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        },
        is_deleted: false,
      },
      {
        is_deleted: true,
      },
      { new: true }
    );
    if (DisableWorking) {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_SUCCESS,
        message: "Working date disable successfully",
        data: DisableWorking,
        // data: null,
        error: null,
      };
      return res.status(RESPONSE_STATUS_CODE_OK).json(responsePayload);
    } else {
      const responsePayload = {
        status: RESPONSE_PAYLOAD_STATUS_ERROR,
        message: null,
        data: {},
        error: "Working date not disable",
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
  addWorkingDay,
  disableWorkingDay,
};
