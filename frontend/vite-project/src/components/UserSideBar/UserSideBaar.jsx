// import React from "react";
// import {
//     Car,
//     Clock3,
//     UserCircle
// } from "lucide-react";

// import { useLocation, useNavigate } from "react-router-dom";

// import "./UserSidebar.css";


// const UserSidebar = () => {

//     const navigate = useNavigate();
//     const location = useLocation();


//     const menuItems = [
//         {
//             name: "Ride",
//             icon: Car,
//             path: "/user/home"
//         },
//         {
//             name: "History",
//             icon: Clock3,
//             path: "/user/history"
//         },
//         {
//             name: "Profile",
//             icon: UserCircle,
//             path: "/user/profile"
//         }
//     ];


//     return (

//         <aside className="user-sidebar">

//             {/* Logo */}

//             <div className="user-sidebar-logo">

//                 <div className="user-logo-icon">
//                     ⚡
//                 </div>

//                 <div>
//                     <h2>VoltRide</h2>
//                     <span>User</span>
//                 </div>

//             </div>


//             {/* Navigation */}

//             <nav className="user-sidebar-menu">

//                 {menuItems.map((item) => {

//                     const Icon = item.icon;

//                     const active =
//                         location.pathname === item.path;

//                     return (

//                         <button
//                             key={item.path}
//                             className={`user-sidebar-item ${
//                                 active ? "active" : ""
//                             }`}
//                             onClick={() =>
//                                 navigate(item.path)
//                             }
//                         >

//                             <Icon size={21} />

//                             <span>
//                                 {item.name}
//                             </span>

//                         </button>

//                     );

//                 })}

//             </nav>

//         </aside>

//     );

// };


// export default UserSidebar;