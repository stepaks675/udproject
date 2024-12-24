import { useState, useEffect } from "react";
import React from "react";

export const Publisher = () => {
  const [pubid, setPubid] = useState(null);
  const [pubname, setPubName] = useState("");

  const [publishers, setPublishers] = useState([]);
  const [games, setGames] = useState([]);

  const [createPub, setCreatePub] = useState(false);
  const [createGame, setCreateGame] = useState(false);

  const [createPubForm, setCreatePubForm] = useState({
    name: "",
    country: "",
  });
  const [createGameForm, setCreateGameForm] = useState({
    title: "",
    genre: "",
    releaseyear: "",
  });

  const [displaycheat, setDisplaycheat] = useState(false);
  const [cheats, setCheats] = useState([]);

  const [targetGame, setTargetGame] = useState(0);
  const [cheatFormState, setCheatFormState] = useState({
    code:"",
    desc:""
  })
  const fetchpubs = () => {
    fetch("http://localhost:3001/publishers")
      .then((r) => r.json())
      .then((data) => {
        let cleanpubs = [];
        if (!data) return;
        data?.forEach((itema) => {
          const pubs = Object.values(itema).map((item) => {
            const cleanstr = item.slice(1, -1);
            const values = cleanstr.split(",");
            return {
              id: values[0],
              name: values[1],
              country: values[2],
            };
          });
          cleanpubs.push(pubs);
        });
        setPublishers(cleanpubs);
      });
  };
  const showCheats = () => {
    setDisplaycheat((p) => !p);
  };
  const fetchgames = (id) => {
    fetch(`http://localhost:3001/gamepub?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        let cleangames = [];
        if (!data) return;
        data?.forEach((item) => {
          let dirtystr = item["get_games_by_publisher"];
          const cleanstr = dirtystr.slice(1, -1);
          const values = cleanstr.split(",");
          cleangames.push({
            id: values[0],
            title: values[1],
            genre: values[2],
            year: values[3],
            score: values[5],
          });
        });
        setGames(cleangames);
      });
  };

  useEffect(() => {
    if (pubid) fetchgames(pubid);
  }, [pubid]);

  useEffect(() => {
    fetchpubs();
  }, []);

  const createCheat = () => {
    fetch("http://localhost:3001/cheats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: pubname,
        gameid: targetGame,
        cheat: cheatFormState.code,
        desc: cheatFormState.desc
      })
    })
    setTimeout(()=>{fetchCheats()},300)
  };

  const fetchCheats = () => {
    fetch("http://localhost:3001/getcheats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: pubname }),
    })
      .then((r) => r.json())
      .then((data) => {
        let entries = []
        data.forEach(item => {
          const dirtystr = item["get_cheat_codes"]
          const cleanstr = dirtystr.slice(1,-1)
          const values = cleanstr.split(",")
          entries.push({
            id: values[0],
            game: games.find(item => item.id==values[1]).title,
            code: values[2],
            desc: values[3]
          })
        })
        setCheats(entries)
      });
  };
  const createGameF = () => {
    if (
      !createGameForm.title ||
      !createGameForm.releaseyear ||
      !createGameForm.genre
    ) {
      alert("Не оставляйте поля пустыми");
    } else {
      fetch("http://localhost:3001/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createGameForm,
          publisher_id: pubid,
        }),
      });
    }
  };
  const createPublisher = () => {
    if (!createPubForm.name || !createPubForm.country) {
      alert("Не оставляйте поля пустыми");
    } else {
      fetch("http://localhost:3001/publishers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPubForm),
      });
      setTimeout(() => fetchpubs(), 300);
    }
  };

  const handleChoose = (id, name) => {
    setPubName(name);
    setPubid(id);
  };

  const handleDeletePub = (id) => {
    fetch("http://localhost:3001/publishers", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id, name: pubname }),
    });
    setTimeout(() => fetchpubs(), 300);
  };

  const handleDeleteGame = (id) => {
    fetch("http://localhost:3001/games", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
  };
  console.log(cheats)
  return (
    <div>
      {displaycheat && (
        <div className="absolute top-0 left-0 h-full w-full shadow-sm bg-white border border-slate-300 ">
          <button
            className="text-3xl font-bold text-red-500 relative left-20 top-10"
            onClick={() => {
              setDisplaycheat((p) => !p);
              setCheats([])
            }}
          >
            ЗАКРЫТЬ
          </button>
          <div className="relative left-32 top-32 h-full w-[1300px] flex justify-around ">
            <div className="flex flex-col gap-4 w-1/2">
              <button
                className="bg-black text-white px-2 py-1"
                onClick={fetchCheats}
              >
                ЗАГРУЗИТЬ ЧИТИ
              </button>
              <table border="1" className="border border-slate-400">
                <thead>
                  <tr>
                    <th className="border border-slate-400">CheatID</th>
                    <th className="border border-slate-400">Target Game</th>
                    <th className="border border-slate-400">CheatCode</th>
                    <th className="border border-slate-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {cheats?.map((item, index) => {
                     return <tr
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                    >
                      <td className="border border-slate-400">{item.id}</td>
                      <td className="border border-slate-400">{item.game}</td>
                      <td className="border border-slate-400">{item.code}</td>
                      <td className="border border-slate-400">{item.desc}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 w-[200px]">
              {" "}
              <div>Создание чита</div>
              <div className=" border border-slate-200">
                <span></span>
                <select
                  value={targetGame}
                  className="w-[200px]"
                  onChange={(e) => {
                    setTargetGame(e.target.value);
                  }}
                >
                  <option value={0} disabled>
                    Выберите Свою Игру
                  </option>
                  {games.map((item) => {
                    return <option value={item.id}>{item.title}</option>;
                  })}
                </select>
              </div>
              <div>
                <span>Код:</span>
                <input value={cheatFormState.code} onChange={(e)=>{
                  setCheatFormState(p=>{
                    return {
                      ...p,
                      code: e.target.value
                    }
                  })
                }}placeholder="Код" type="text" className="bg-black text-white font-bold w-[200px] px-2 my-1"></input>
              </div>
              <div>
                <span>Описание:</span>
                <input value={cheatFormState.desc} onChange={(e)=>{
                  setCheatFormState(p=>{
                    return {
                      ...p,
                      desc: e.target.value
                    }
                  })
                }}placeholder="Описание" type="text" className=" font-bold w-[200px] px-2 my-1"></input>
              </div>
              <button className="bg-green-300 text-white p-3" onClick={createCheat}>Создать</button>
            </div>

          </div>
        </div>
      )}
      {pubid && <span className="text-5xl font-serif">Вы: {pubname}</span>}
      <div className="flex w-full justify-between">
        <div className="w-[400px] flex flex-col gap-4 border border-slate-600 bg-slate-50 overflow-y-auto h-[600px]">
          <div className="flex gap-5 items-center px-2 pt-2">
            <span className="text-xl">Выберите себя или добавьте нового</span>{" "}
            <button
              onClick={() => setCreatePub((p) => !p)}
              className="bg-green-400 p-2"
            >
              Добавить нового
            </button>
          </div>
          {!createPub ? (
            <div className="flex flex-col gap-4">
              {publishers.map((item, index) => {
                return (
                  <PublisherP
                    key={index}
                    id={item[0].id}
                    name={item[0].name}
                    country={item[0].country}
                    onChoose={handleChoose}
                    onDelete={handleDeletePub}
                    isMe={item[0].id == pubid}
                    showCheats={showCheats}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-2">
              <div className="flex justify-between">
                <span>Название компании</span>
                <input
                  className="border"
                  type="text"
                  onChange={(e) => {
                    setCreatePubForm((p) => {
                      return {
                        ...p,
                        name: e.target.value,
                      };
                    });
                  }}
                  value={createPubForm.name}
                ></input>
              </div>
              <div className="flex justify-between">
                <span>Страна</span>
                <input
                  className="border"
                  type="text"
                  onChange={(e) => {
                    setCreatePubForm((p) => {
                      return {
                        ...p,
                        country: e.target.value,
                      };
                    });
                  }}
                  value={createPubForm.country}
                ></input>
              </div>
              <button
                className="bg-green-300 p-2 my-2"
                onClick={createPublisher}
              >
                Создать
              </button>
            </div>
          )}
        </div>

        <div className="w-[600px] border border-slate-600 bg-slate-50 flex flex-col gap-3 overflow-y-auto h-[600px]">
          <div className="flex gap-5 items-center px-2 pt-2 border border-slate-100 shadow-sm pb-2">
            <span className="text-xl">ИГРЫ</span>{" "}
            <button
              onClick={() => setCreateGame((p) => !p)}
              className="bg-green-400 p-2"
            >
              Создать игру
            </button>
            <button
              className="bg-blue-400 mx-2 px-2 font-mono"
              onClick={() => fetchgames(pubid)}
            >
              Refetch
            </button>
          </div>
          {!createGame || !pubid ? (
            <div>
              {games.map((item) => (
                <GameEntity
                  id={item.id}
                  title={item.title}
                  genre={item.genre}
                  score={item.score}
                  year={item.year}
                  onDelete={handleDeleteGame}
                />
              ))}
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-2 px-2">
                <div className="flex justify-between">
                  <span>Название игры</span>
                  <input
                    className="border"
                    type="text"
                    onChange={(e) => {
                      setCreateGameForm((p) => {
                        return {
                          ...p,
                          title: e.target.value,
                        };
                      });
                    }}
                    value={createGameForm.title}
                  ></input>
                </div>
                <div className="flex justify-between">
                  <span>Жанр</span>
                  <input
                    className="border"
                    type="text"
                    onChange={(e) => {
                      setCreateGameForm((p) => {
                        return {
                          ...p,
                          genre: e.target.value,
                        };
                      });
                    }}
                    value={createGameForm.genre}
                  ></input>
                </div>
                <div className="flex justify-between">
                  <span>Год выпуска</span>
                  <input
                    className="border"
                    type="number"
                    onChange={(e) => {
                      setCreateGameForm((p) => {
                        return {
                          ...p,
                          releaseyear: e.target.value,
                        };
                      });
                    }}
                    value={createGameForm.releaseyear}
                  ></input>
                </div>
                <button className="bg-green-300 p-2 my-2" onClick={createGameF}>
                  Создать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PublisherP = ({
  id,
  name,
  country,
  onDelete,
  onChoose,
  isMe,
  showCheats,
}) => {
  return (
    <div className="px-2 flex flex-col gap-2 border border-slate-200">
      <span className="font-bold block">ID: {id}</span>
      <span className="font-bold block">Name: {name}</span>
      <span className="font-bold block">Country: {country}</span>
      <button onClick={() => onChoose(id, name)} className="bg-blue-500">
        Это я
      </button>
      {isMe && (
        <>
          <button
            onClick={() => {
              onDelete(id);
            }}
            className="bg-red-500"
          >
            Удалить
          </button>
          <button
            className="bg-black text-white text-bold"
            onClick={showCheats}
          >
            Чит-коды
          </button>
        </>
      )}
    </div>
  );
};

const GameEntity = ({ id, title, genre, year, score, onDelete }) => {
  return (
    <div className="px-2 flex flex-col gap-2 border border-slate-200 my-2">
      <span className="font-bold block">ID: {id}</span>
      <span className="font-bold block">Title: {title}</span>
      <span className="font-bold block">Genre: {genre}</span>
      <span className="font-bold block">Release Year: {year}</span>
      <span className="font-bold block">Score: {score}</span>
      <button
        onClick={() => {
          onDelete(id);
        }}
        className="bg-red-500"
      >
        Удалить
      </button>
    </div>
  );
};
