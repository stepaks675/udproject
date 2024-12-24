import { useState } from "react";
import Swal from "sweetalert2";

export const Admin = () => {
    const [username, setUsername] = useState("")
    const [pincode, setPincode] = useState(null)

    const clearAll = () => {
        fetch("http://localhost:3001/admin/purge", {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                pincode
            })
        })
    }

    const clearReviews = () => {
        fetch("http://localhost:3001/admin/reviews", {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                pincode
            })
        })
    }

    const deleteUser = () => {
        fetch("http://localhost:3001/admin/deleteuser", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                pincode,
                username
            })
        })
    }
  return (
    <div className="flex flex-col gap-5">
    <div className="grid grid-cols-3 gap-5">
      <button className="text-3xl font-bold p-3 border border-black rounded-xl text-red-500 hover:bg-red-500 hover:text-white duration-[3000ms]" onClick={()=>{
        Swal.fire({
            title: "Вы уверены?",
            text: "Это действие необратимо!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Да",
            cancelButtonText: "Отмена",
          }).then((result) => {
            if (result.isConfirmed) {
              clearAll()
            } else {
            }
          });
      }}>
        ОЧИСТИТЬ ВСЁ
      </button>
      <button onClick={clearReviews} className="text-3xl font-bold p-3 border border-black rounded-xl text-red-500">
        ОЧИСТИТЬ ВСЕ ОТЗЫВЫ
      </button>

      <div>
        <input
          type="text"
          className="text-3xl font-bold p-3 border border-black rounded-xl mb-2"
          value={username}
          onChange={(e)=>{
            setUsername(e.target.value)
          }}
        ></input>
        <button onClick={()=>{
            deleteUser()
        }} className="text-3xl font-bold p-3 border border-black rounded-xl text-red-500">
          УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ
        </button>
      </div>
    </div>
    <input placeholder="SECRET PASSWORD" type="password" value={pincode} onChange={(e)=>{
        setPincode(e.target.value)
    }} className="w-full text-5xl font-bold p-2 border border-black"></input>
    </div>
  );
};
