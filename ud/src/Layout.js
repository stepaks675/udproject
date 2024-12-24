import React from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
export const Layout = () => {
  return (
    <>
      <div className="w-screen h-32 flex justify-around items-center bg-slate-200">
        <Link to="user"><span className="text-6xl font-bold">Я Пользователь</span></Link>
        <Link to="publisher"><span className="text-6xl font-bold">Я Издатель</span></Link>
        <Link to="admin"><span className="text-6xl font-bold">Я Админ</span></Link>
      </div>
      <div className="px-64 pt-10"><Outlet/></div>
    </>
  );
};
