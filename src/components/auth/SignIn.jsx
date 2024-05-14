import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loading from "../Loader/Loading";

const SignIn = () => {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState("checkingAuth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthStatus("checkingAuth");
    try {
      await axios.post("http://localhost:8000/login", {
        username: email,
        password: password,
      }, { withCredentials: true });
      navigate("/");
    } catch (error) {
      setSignInError("Invalid email or password, please try again.");
      setAuthStatus("unauthenticated");
    }
  };

  useEffect(() => {
    axios.get("http://localhost:8000/protected", { withCredentials: true })
      .then(response => {
        if (response.data.msg) {
          setAuthStatus("authenticated");
          navigate("/");
        }
      })
      .catch(() => {
        setAuthStatus("unauthenticated");
      });
  }, [navigate]);

  if (authStatus === "checkingAuth") {
    return <Loading />;
  }

  return (
    <section className="bg-bodyBg">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSignIn}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="name@company.com"
                  required=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required=""
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSignInError(""); // Optionally clear the error when the user starts typing
                  }}
                />
                {signInError && (
                  <p className="text-red-500 text-sm mt-2">{signInError}</p>
                )} 
              </div>

              <button
                type="submit"
                className="w-full text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Sign in
              </button>

              <p className="text-sm font-light text-gray-500">
                Don't have an account yet?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-yellow-500 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
