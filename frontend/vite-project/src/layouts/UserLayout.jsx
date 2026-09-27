import React from "react";

import UserSidebar from "../components/UserSideBar/UserSideBaar";

import "./UserLayout.css";


const UserLayout = ({ children }) => {

	return (

	<div className="user-layout">

			<UserSidebar />

			<main className="user-layout-content">

				{children}

			</main>

	</div>

	);

};


export default UserLayout;