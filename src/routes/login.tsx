import React from "react";
import { Navigate } from "react-router";

export const LoginRedirect: React.FC = () => {
	return <Navigate to="/authentication/login" replace />;
};

export default LoginRedirect;
