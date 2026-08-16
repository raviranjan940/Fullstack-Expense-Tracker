import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { db, doc, getDoc, setDoc } from "@/lib/firebase";
import { toast } from "react-toastify";

async function createUserDoc(clerkUser) {
  if (!clerkUser) return;
  const userRef = doc(db, "users", clerkUser.id);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || "";
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      primaryEmail.split("@")[0] ||
      "User";
    await setDoc(userRef, {
      name,
      email: primaryEmail,
      photoURL: clerkUser.imageUrl || "",
      createdAt: new Date(),
    });
  }
}

// Ensures a Firestore profile document exists for the signed-in Clerk user,
// regardless of which auth method created the session.
function UserDocSync() {
  const { isLoaded, user } = useUser();
  const createdRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || createdRef.current) return;
    createdRef.current = true;
    createUserDoc(user).catch((error) => {
      console.error("Error creating user doc: ", error);
      toast.error("Failed to create profile");
    });
  }, [isLoaded, user]);

  return null;
}

export default UserDocSync;