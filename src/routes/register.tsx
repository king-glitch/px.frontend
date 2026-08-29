import React from "react";
import { Navigate } from "react-router";

export const RegisterRedirect: React.FC = () => {
	return <Navigate to="/authentication/register" replace />;
};

export default RegisterRedirect;
