import { useEffect, useState } from "react";
import { useGoogleLogin, googleLogout, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import "../css/Auth.css";

const APP_URL = "http://localhost:8000";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth !== null || auth === "false") {
      navigate("/gage");
    }
  }, []);

  async function handleStandardSignup(e) {
    e.preventDefault();
    try {
      const user = await axios.post(APP_URL + "/auth/standard-sign-up", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      });
      console.log(user);
      localStorage.setItem("auth", "true");
      navigate("/gage", { state: { email: email } });
    } catch (err) {
      console.error(err);
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
  }

  async function handleStandardLogin(e) {
    e.preventDefault();
    try {
      const user = await axios.post(APP_URL + "/auth/standard-login", {
        email: email,
        password: password,
      });
      console.log(user);
      localStorage.setItem("auth", "true");
      navigate("/gage", { state: { email: email } });
    } catch (err) {
      console.error(err);
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
  }

  async function handleGoogleSignup(credentialResponse) {
    const googleUser = jwtDecode(credentialResponse.credential);
    const email = googleUser.email;
    const firstName = googleUser.given_name;
    const lastName = googleUser.family_name;

    try {
      const user = await axios.post(APP_URL + "/auth/google-sign-up", {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
      console.log(user.data);
      localStorage.setItem("auth", "true");
      navigate("/gage", { state: { email: email } });
    } catch (err) {
      console.error(err);
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
  }

  async function handleGoogleLogin(credentialResponse) {
    const googleUser = jwtDecode(credentialResponse.credential);
    const email = googleUser.email;

    try {
      const user = await axios.post(APP_URL + "/auth/google-login", {
        email: email,
      });
      console.log(user.data);
      localStorage.setItem("auth", "true");
      navigate("/gage", { state: { email: email } });
    } catch (err) {
      console.error(err);
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
  }

  // localStorage.clear();

  return (
    <div className="auth-wrapper">
      <div className="auth-header-wrapper">
        <h1 className="auth-header">{isLogin ? "Log in" : "Sign up"}</h1>
        <button className="auth-option" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign up instead?" : "Log in instead?"}
        </button>
      </div>

      <form className="auth-form">
        <div className="google-auth-wrapper">
          <GoogleLogin
            onSuccess={
              isLogin
                ? (credentialResponse) => handleGoogleLogin(credentialResponse)
                : (credentialResponse) => handleGoogleSignup(credentialResponse)
            }
            onError={() => console.log("fail")}
            size="medium"
            text={isLogin ? "continue_with" : "signup_with"}
            theme="filled_blue"
          ></GoogleLogin>
        </div>

        <div className="auth-form-content">
          {!isLogin && (
            <label htmlFor="first-name" className="auth-input-label">
              First Name
            </label>
          )}
          {!isLogin && (
            <input
              name="first-name"
              placeholder="Enter your first name here..."
              type="text"
              className="auth-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          )}
          {!isLogin && (
            <label htmlFor="last-name" className="auth-input-label">
              Last Name
            </label>
          )}
          {!isLogin && (
            <input
              name="last-name"
              placeholder="Enter your last name here..."
              type="text"
              className="auth-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          )}
          <label htmlFor="email" className="auth-input-label">
            Email
          </label>
          <input
            name="email"
            placeholder="Enter your email here..."
            type="text"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="auth-input-label">
            Password
          </label>
          <input
            name="password"
            placeholder="Enter your password here..."
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="standard-submit"
          onClick={
            isLogin
              ? (e) => handleStandardLogin(e)
              : (e) => handleStandardSignup(e)
          }
        >
          {isLogin ? "Log in" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
