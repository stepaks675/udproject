import { useState } from "react";
import { useEffect } from "react";
import { FcLike } from "react-icons/fc";
import { CiSearch } from "react-icons/ci";

export const User = () => {
  const [favorite, setfavorite] = useState(null);
  const [uid, setUid] = useState(0);
  const [uname, setUname] = useState("");

  const [filtervals, setFiltervals] = useState([]);

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [searchState, setSearchState] = useState("");

  const [reviewing, setReviewing] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const [creatingUser, setCreatingUser] = useState(false)
  const [formUsername, setFormUsername] = useState("")
  const fetchUsers = () => {
    fetch("http://localhost:3001/users")
      .then((r) => r.json())
      .then((data) => {
        let userso = [];
        data.forEach((item) => {
          const dirtystr = item["get_all_users"];
          const cleanstr = dirtystr.slice(1, -1);
          const values = cleanstr.split(",");
          userso.push({
            id: values[0],
            name: values[1],
            favorite: values[2],
          });
        });
        setUsers(userso);
      });
  };

  const fetchGamesByName = (title) => {
    fetch("http://localhost:3001/gamesbyname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: title }),
    })
      .then((r) => r.json())
      .then((data) => {
        let values = [];
        data.forEach((item) => {
          values.push(item["search_games_by_title"]);
        });
        setFiltervals(values);
      });
  };
  const fetchGames = () => {
    fetch("http://localhost:3001/games")
      .then((r) => r.json())
      .then((data) => {
        let gameso = [];
        data.forEach((item) => {
          const dirtystr = item["get_all_games"];
          const cleanstr = dirtystr.slice(1, -1);
          const values = cleanstr.split(",");
          gameso.push({
            id: values[0],
            title: values[1],
            genre: values[2],
            year: values[3],
            publisher: values[4],
            score: values[5],
          });
        });
        setGames(gameso);
      });
  };

  const fetchReviews = (gameid) => {
    fetch(`http://localhost:3001/reviews?gameid=${gameid}`)
      .then((r) => r.json())
      .then((data) => {
        let revs = [];
        data.forEach((item) => {
          const dirtystr = item["get_reviews_by_game"];
          const cleanstr = dirtystr.slice(1, -1);
          const values = cleanstr.split(",");
          revs.push({
            author: users.find((item) => item.id == values[1]).name,
            scoring: values[3],
            comment: values[4],
            timestamp: values[5].slice(0, -11),
          });
        });
        setReviews(revs);
      });
  };

  const handleUser = (id, name, favorite) => {
    setUid(id);
    setUname(name);
    setfavorite(favorite);
  };
  const handleCreateUser = () => {
    fetch(`http://localhost:3001/newuser?name=${formUsername}`).then(
      setTimeout(()=>fetchUsers(),300)
    )
  }
  const ReviewingOn = (title, id) => {
    setReviewing(true);
    setSelectedGame({ title, id });
    fetchReviews(id);
  };
  const sendReview = (gameid, score, comment) => {
    fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: uid,
        gameid: gameid,
        score: score,
        comment: comment,
      }),
    });
    setTimeout(() => fetchGames(), 300);
  };
  const handleUserDelete = (id) => {
    setUid(0);
    setUname("");
    setfavorite(null);
    fetch("http://localhost:3001/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    setTimeout(() => fetchUsers(), 300);
  };

  const handleFavorite = (id) => {
    setfavorite(id);
    fetch("http://localhost:3001/fav", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id, userid: uid }),
    });
    setTimeout(() => fetchUsers(), 300);
  };

  useEffect(() => {
    fetchUsers();
    fetchGames();
  }, []);

  let filteredGames = [...games];
  console.log(filteredGames, games, filtervals);
  if (filtervals.length > 0) {
    filteredGames = games.filter((item) =>
      filtervals.includes(parseInt(item.id))
    );
  }

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col w-[500px] border border-slate-200 ">
        <span className="text-3xl font-bold my-2">
          Вы залогинены как: {uname}
        </span>
        <div className="flex justify-around items-center">
          <span className="text-xl">Выберите или создайте себя</span>
          <button className="bg-green-300 p-3" onClick={()=>{
            setCreatingUser(p=>!p)
          }}>Создать Пользователя</button>
        </div>
        {!creatingUser ?
        <div className="flex flex-col gap-2 h-[600px] overflow-y-auto">
          {users.map((item) => {
            return (
              <UserItem
                id={item.id}
                username={item.name}
                favorite={
                  item.favorite &&
                  games?.find((val) => val.id == item.favorite)?.title
                }
                favoriteid={item.favorite}
                isMe={item.id == uid}
                handleClick={handleUser}
                handleDelete={handleUserDelete}
              />
            );
          })}
        </div> : <div className="w-[250px] my-10 mx-auto"><div className="flex justify-between">
                <span>Имя</span>
                <input
                  className="border"
                  type="text"
                  onChange={(e) => {
                    setFormUsername(e.target.value)
                  }}
                  value={formUsername}
                ></input>
              </div>
              <button className="bg-green-300 w-full text-center m-2" onClick={handleCreateUser}>Создать</button>
              </div>}
      </div> 
      <div className="flex flex-col w-[700px] border border-slate-200 ">
        <div className="flex justify-between items-center h-20 border-b border-slate-100 shadow-sm">
          <span
            className="text-3xl mx-2 cursor-pointer"
            onClick={() => {
              setReviewing(false);
            }}
          >
            Каталог игр
          </span>
          <div className="flex justify-center px-10">
            <input
              type="text"
              placeholder="Поиск по названию"
              value={searchState}
              onChange={(e) => {
                setSearchState(e.target.value);
              }}
            ></input>
            <CiSearch
              className="size-10 cursor-pointer"
              onClick={() => {
                fetchGamesByName(searchState);
              }}
            />
          </div>
        </div>
        {!reviewing ? (
          <div className="flex flex-col gap-2 h-[600px] overflow-y-auto">
            {filteredGames?.map((item) => {
              return (
                <GameItem
                  id={item.id}
                  title={item.title}
                  genre={item.genre}
                  publisherID={item.publisher}
                  score={item.score}
                  year={item.year}
                  isFavorite={favorite == item.id}
                  handleFav={handleFavorite}
                  changeMode={ReviewingOn}
                  uid={uid}
                />
              );
            })}
          </div>
        ) : (
          <div>
            <ReviewForm game={selectedGame} sendReview={sendReview} />
            <div className="flex flex-col gap-2 h-[400px] overflow-y-auto">
              {reviews.map((item) => (
                <ReviewItem review={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserItem = ({
  id,
  username,
  favorite,
  isMe,
  handleClick,
  handleDelete,
  favoriteid,
}) => {
  return (
    <div className="flex flex-col py-3 px-2 border border-slate-100 my-2">
      <span className="font-bold">ID: {id}</span>
      <span className="font-thin">Username: {username}</span>
      <span className="text-yellow-300 font-bold">
        Favorite game: {favorite}{" "}
      </span>
      <button
        className="bg-green-300 my-2"
        onClick={() => {
          handleClick(id, username, favoriteid);
        }}
      >
        Это я
      </button>
      {isMe && (
        <button className="bg-red-400" onClick={() => handleDelete(id)}>
          Удалить Аккаунт
        </button>
      )}
    </div>
  );
};
const GameItem = ({
  id,
  title,
  genre,
  year,
  publisherID,
  score,
  isFavorite,
  uid,
  handleFav,
  changeMode,
}) => {
  return (
    <div
      className={`flex flex-col py-3 px-2 border border-slate-200 relative my-3 ${
        isFavorite && "bg-gradient-to-r from-green-200 to-blue-300 border-black"
      }`}
    >
      {!isFavorite && uid ? (
        <FcLike
          className="absolute right-16 size-10 top-20 cursor-pointer hover:scale-105"
          onClick={() => {
            handleFav(id);
          }}
        />
      ) : null}
      <span className="font-bold">ID: {id}</span>
      <span className="">Title: {title}</span>
      <span
        className={`font-bold 
        ${score > 0 && score < 4 ? "text-red-500" : ""} 
        ${parseFloat(score) > 4 && score < 7 ? "text-yellow-400" : ""} 
        ${parseFloat(score) > 7 ? "text-green-500" : ""}`}
      >
        Rating: {score}
      </span>
      <span className="">Genre: {genre}</span>
      <span className="">Released: {year}</span>
      <span className="">PublisherID: {publisherID}</span>
      {uid > 0 && (
        <button
          className="border border-slate-200 p-2 m-1"
          onClick={() => {
            changeMode(title, id);
          }}
        >
          Отзывы
        </button>
      )}
    </div>
  );
};

const ReviewForm = ({ game, sendReview }) => {
  const [formState, setFormState] = useState({
    score: 5,
    comment: "",
  });
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl">Оцените {game.title}!</span>
      <div className="flex items-center">
        <span>Ваша оценка: {formState.score}</span>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={formState.score}
          onChange={(e) => {
            setFormState((p) => {
              return {
                ...p,
                score: e.target.value,
              };
            });
          }}
        ></input>
      </div>
      <textarea
        className="px-2 mb-2 border border-slate-500 w-[300px]"
        rows={5}
        value={formState.comment}
        maxLength={300}
        placeholder="Оставьте комментарий (макс 300 символов)"
        onChange={(e) => {
          setFormState((p) => {
            return {
              ...p,
              comment: e.target.value,
            };
          });
        }}
      ></textarea>
      <button
        className="p-2 shadow-xl border border-slate-300"
        onClick={() => {
          sendReview(game.id, formState.score, formState.comment);
        }}
      >
        Отправить
      </button>
    </div>
  );
};
const ReviewItem = ({ review }) => {
  return (
    <div className="flex flex-col gap-2 px-2 my-2 mx-10 bg-slate-50 border border-slate-200 shadow-sm rounded-xl">
      <span className="block font-bold text-xl">
        Оценка пользователя: {review.scoring}/10
      </span>
      <span className="pl-1 font-light text-lg">{review.comment}</span>
      <div className="flex justify start">
        <span className="font-light text-gray-500 ">
          Автор: {review.author}{" "}
        </span>
        <span className="ml-2 font-light text-gray-500">
          {" "}
          опубликовано {review.timestamp}
        </span>
      </div>
    </div>
  );
};
