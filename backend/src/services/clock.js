// The only place that knows what time it is. Tests pass a fixed clock instead.
import { todayISO } from "../domain/stay.js";

export const createClock = ({ timezone, now = () => new Date() }) => ({
  now,
  today: () => todayISO(now(), timezone),
});
