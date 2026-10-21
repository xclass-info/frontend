import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { isAccountVerified } from "./accountVerification";

// Resolves the logged-in student's account: a logged-in Firebase Auth user
// with a matching, verified students/{uid} record. Mentors (no students
// record) and unverified accounts resolve to student: null, same as being
// logged out.
export function useStudentAuth() {
  const [state, setState] = useState({ loading: true, student: null });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setState({ loading: false, student: null });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "students", user.uid));
        const data = snap.exists() ? snap.data() : null;
        setState({
          loading: false,
          student:
            data && isAccountVerified(data)
              ? { uid: user.uid, name: data.name, email: user.email }
              : null,
        });
      } catch {
        setState({ loading: false, student: null });
      }
    });
    return () => unsub();
  }, []);

  return state;
}
