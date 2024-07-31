const { Router } = require("express");
const {
  checkoutOrderItems,
  getEmployeeOrders,
  deleteOrderItems,
} = require("../../../controllers/snacks/orders/order.controller");

const orderRouter = Router();

/* ADD ORDER ITEMS */
orderRouter.post("/checkout", checkoutOrderItems);

/* GET EMPLOYEE'S TODAY'S ORDERS */
orderRouter.post("/employee-orders", getEmployeeOrders);

/* DELETE ORDER ITEMS */
orderRouter.delete("/delete-order-items/:item_id", deleteOrderItems);

module.exports = {
  orderRouter,
};
