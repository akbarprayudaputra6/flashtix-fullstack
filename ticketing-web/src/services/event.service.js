import api from "./api";

export const fetchAllEvents = async () => {
  const { data } = await api.get("/events");
  return data.data.events;
};

export const createEvent = async (payload) => {
  const { data } = await api.post("/events", payload);
  return data.data.event;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};
