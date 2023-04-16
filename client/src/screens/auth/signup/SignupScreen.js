import React, { useState,useRef } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import ApiConnector from "../../../api/apiConnector";
import ApiEndpoints from "../../../api/apiEndpoints";
import AppPaths from "../../../lib/appPaths";
import "../authStyle.css";
import { useNavigate } from 'react-router-dom';
const SignupScreen = () => {
  const navigate=useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const password = useRef({});
  password.current = watch("password");
  const image = watch("image");
  const [accountType, setAccountType] = useState("");
  const onSubmit = async (signupData) => {
    const formData = new FormData();
    formData.append("image", signupData.image[0]);
    delete signupData["image"];
    Object.keys(signupData).forEach((key) => {
      formData.append(key, signupData[key]);
    });
    formData.append("is_shop_owner", accountType==='Customer'?false:true);
    const successSignupData = await ApiConnector.sendPostRequest(
      ApiEndpoints.SIGN_UP_URL,
      formData,
      false,
      true
    );
    if (successSignupData) {
      // history.push({
      //   pathname: AppPaths.LOGIN,
      //   state: { redirectFrom: AppPaths.SIGN_UP },
      // });
      navigate(AppPaths.LOGIN);
    }
  };

  return (
    <div id="authFormContainer">
      <div id="authForm">
        <h2 id="authTitle">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="authFieldContainer">
            <input
              className="authField"
              type="text"
              placeholder="First Name"
              {...register("first_name", { required: true })}
            />
            {errors.first_name && (
              <p className="requiredFieldError">This field is required</p>
            )}
          </div>
          <div className="authFieldContainer">
            <input
              className="authField"
              type="text"
              placeholder="Last Name"
              {...register("last_name", { required: true })}
            />
            {errors.last_name && (
              <p className="requiredFieldError">This field is required</p>
            )}
          </div>
          <div className="authFieldContainer">
            <input
              className="authField"
              type="email"
              placeholder="Email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <p className="requiredFieldError">This field is required</p>
            )}
          </div>
          <div>
            <input

              style={{ backgroundColor: '#344153', maxWidth: '19.5vw', overflow: 'hidden', borderRadius: '15px' }}
              type="file"
              name="image"
              id="validatedCustomFile"
              {...register("image", {
                required: true,
              })}
            />

            {errors.image && (
              <p className="requiredFieldError mt-2">This field is required</p>
            )}
          </div>
          <div style={{ color: 'white' }} className="authFieldContainer">
            <select
              className="form-select form-select mb-3 bg-dark"
              style={{color:'white'}}
              aria-label=".form-select-lg example"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >

              <option style={{ color: 'white' }} selected>Account Type</option>
              <option value="1">Customer</option>
              <option value="2">Shopowner</option>
            </select>
          </div>
          <div className="authFieldContainer">
            <input
              className="authField"
              type="password"
              placeholder="Password"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <p className="requiredFieldError">This field is required</p>
            )}
          </div>
          <div className="authFieldContainer">
            <input
              className="authField"
              type="password"
              name="passwordTwo"
              placeholder="Confirm Password"
              {...register("passwordTwo", {
                required: "This field is required",
                validate: (value) =>
                  value === password.current || "The passwords doesn't match",
              })}
            />
            {errors.passwordTwo && (
              <p className="requiredFieldError">
                {errors.passwordTwo?.message}
              </p>
            )}
          </div>
          <br />
          <button id="login" className="btn" type="submit">
            Sign Up
          </button>
        </form>
        <p id="authFormFooter">
          Already have an account. <Link to="/login">Click here</Link> to login.
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
