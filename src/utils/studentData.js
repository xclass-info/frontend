import { api, seg } from "../api";

// Everything the student dashboard lists: the logged-in student's
// registrations (newest first), each with the item as it is now and the
// mentor's name. `item` is null if the item has since been deleted.
export function loadMyRegistrations() {
  return api.get("/students/me/registrations");
}

// Same list for any student, for the admin dashboard.
export function loadStudentRegistrations(studentId) {
  return api.get(`/admin/students/${seg(studentId)}/registrations`);
}
