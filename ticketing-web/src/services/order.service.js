import api from "./api";

export const bookTicket = async ({ eventId, quantity }) => {
  const { data } = await api.post("/orders/book", { eventId, quantity });
  return data.data.order;
};

export const fetchMyOrders = async () => {
  const { data } = await api.get("/orders/my-orders");
  return data.data.orders;
};

export const fetchAllOrders = async () => {
  const { data } = await api.get("/orders");
  return data.data.orders;
};
