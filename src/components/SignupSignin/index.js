import React, { useState } from "react";
import "./styles.css";
import InputComponent from "../Input";
import Button from "../Button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function SignupSignin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState(false);
  const navigate = useNavigate();

  function signupWithEmail() {
    setLoading(true);
    //Authentication logic goes here
    if (name != "" && email != "" && password != "" && confirmPassword != "") {
      if (password == confirmPassword) {
        //Signup
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User: ", user);
            toast.success("User signed up successfully");
            setLoading(false);
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            // Create a doc with user id as the following id
            createDoc(user);
            navigate("/dashboard");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            toast.error(errorMessage);
            setLoading(false);
            // ..
          });
      } else {
        //Show error
        toast.error("Passwords do not match");
        setLoading(false);
      }
    } else {
      //Show error
      toast.error("Please fill all the fields");
      setLoading(false);
    }
  }

  function signinWithEmail() {
    setLoading(true);
    //Authentication logic goes here
    if (email != "" && password != "") {
      //Signin
      //Signin
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log("User: ", user);
          toast.success("User signed in successfully");
          setLoading(false);
          navigate("/dashboard");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          toast.error(errorMessage);
          setLoading(false);
        });
    } else {
      //Show error
      toast.error("Please fill all the fields");
      setLoading(false);
    }
  }

  async function createDoc(user) {
    setLoading(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName ? displayName : name,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
        });
        toast.success("Account Created!");
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
        setLoading(false);
      }
    }
  }

  function handleSigninSignupToggle() {
    setLoginForm(!loginForm);
  }

  function handleGoogleSignin() {
    //Google Signin
    setLoading(true);
    try{
      signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        createDoc(user);
        setLoading(false);
        navigate("/dashboard");
        toast.success("User signed in successfully");
      })
      .catch((error) => {
        // Handle Errors here.
        setLoading(false);
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(errorMessage);
      });
    } catch (e) {
      setLoading(false);
      toast.error(e.message);
    }
  }

  return (
    <>
      {loginForm ? (
        <>
          <div className="signup-wrapper">
            <h2 className="title">
              Sign in on <span style={{ color: "var(--theme)" }}>Spendly.</span>
            </h2>
            <form>
              <InputComponent
                type="email"
                label={"Email"}
                sate={email}
                setState={setEmail}
                placeholder={"example@gmail.com"}
              />
              <InputComponent
                type="password"
                label={"Password"}
                sate={password}
                setState={setPassword}
                placeholder={"********"}
              />
              <Button
                disabled={loading}
                text={
                  loading ? "Loading..." : "Signin Using Email and Password"
                }
                onClick={signinWithEmail}
              />
              <p className="p-login">or</p>
              <Button
                text={loading ? "Loading" : "Signin Using Google"}
                blue={true}
                onClick={handleGoogleSignin}
              />
              <p className="p-login" onClick={handleSigninSignupToggle}>
                or Don't have an Account? Click Here
              </p>
            </form>
          </div>
        </>
      ) : (
        <div className="signup-wrapper">
          <h2 className="title">
            Sign up on <span style={{ color: "var(--theme)" }}>Spendly.</span>
          </h2>
          <form>
            <InputComponent
              type="text"
              label={"Full Name"}
              sate={name}
              setState={setName}
              placeholder={"John Doe"}
            />
            <InputComponent
              type="email"
              label={"Email"}
              sate={email}
              setState={setEmail}
              placeholder={"example@gmail.com"}
            />
            <InputComponent
              type="password"
              label={"Password"}
              sate={password}
              setState={setPassword}
              placeholder={"********"}
            />
            <InputComponent
              type="password"
              label={"Confirm Password"}
              sate={confirmPassword}
              setState={setConfirmPassword}
              placeholder={"********"}
            />
            <Button
              disabled={loading}
              text={loading ? "Loading..." : "Signup Using Email and Password"}
              onClick={signupWithEmail}
            />
            <p className="p-login">or</p>
            <Button
              text={loading ? "Loading" : "Signup Using Google"}
              blue={true}
              onClick={handleGoogleSignin}
            />
            <p className="p-login" onClick={handleSigninSignupToggle}>
              or Have an Account Already? Click Here
            </p>
          </form>
        </div>
      )}
    </>
  );
}

export default SignupSignin;
