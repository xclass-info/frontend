import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Resolves the logged-in student's account: a verified Firebase Auth user
// with a matching students/{uid} record. Mentors (no students record) and
// unverified accounts resolve to student: null, same as being logged out.
export function useStudentAuth() {
  const [state, setState] = useState({ loading: true, student: null });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user || !user.emailVerified) {
        setState({ loading: false, student: null });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "students", user.uid));
        setState({
          loading: false,
          student: snap.exists()
            ? { uid: user.uid, name: snap.data().name, email: user.email }
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
