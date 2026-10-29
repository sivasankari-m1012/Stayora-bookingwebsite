// Composition root: the ONE place where concrete pieces are wired together (manual dependency injection).
// Tests build a container with an in-memory DB and a fixed clock; production uses a file DB and the real clock.
import { createContentRepository } from "./repositories/contentRepository.js";
import { createBookingRepository } from "./repositories/bookingRepository.js";
import { createClock } from "./services/clock.js";
import { createContentService } from "./services/contentService.js";
import { createAvailabilityService } from "./services/availabilityService.js";
import { createBookingService } from "./services/bookingService.js";

export function createContainer({ db, config, now }) {
  const clock = createClock({ timezone: config.timezone, now });
  const content = createContentRepository(db);
  const bookingsRepo = createBookingRepository(db);
  const availability = createAvailabilityService({ content, bookings: bookingsRepo, clock });
  return {
    db,
    content,
    contentService: createContentService({ content }),
    availability,
    bookings: createBookingService({ db, content, bookings: bookingsRepo, availability, clock }),
  };
}
