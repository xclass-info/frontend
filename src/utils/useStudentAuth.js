import { useEffect, useState } from "react";
import { onAuthStateChanged } from "../auth";
import { isAccountVerified } from "./accountVerification";

// Resolves the logged-in student's account: a logged-in user with a
// matching, verified student record. Mentors (no student record) and
// unverified accounts resolve to student: null, same as being logged out.
export function useStudentAuth() {
  const [state, setState] = useState({ loading: true, student: null });

  useEffect(
    () =>
      onAuthStateChanged((user) => {
        const data = user?.student;
        setState({
          loading: false,
          student:
            data && isAccountVerified(data)
              ? { uid: user.uid, name: data.name, email: user.email }
              : null,
        });
      }),
    [],
  );

  return state;
}
