import React from "react";
import { NavLink } from "react-router-dom";

function Aside(props) {
  return (
    <div className="hidden md:block h-screen w-64 bg-blue-200 p-3 text-sm">
      <ul className="font-medium">
        {props.forHam &&
          props.forHam.map((ele, index) => (
            <li key={index} className="mt-6 px-8 text-left">
              {/* Use ele.path for NavLink and ele.name for display */}
              <NavLink to={ele.path}>
                <span className="border-2 border-transparent hover:border-b-black">
                  {ele.name}
                </span>
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Aside;
