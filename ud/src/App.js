import { Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { Publisher } from "./Publisher";
import { User } from "./User";
import { Admin } from "./Admin";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path ="/" element={<Layout/>}>
          <Route path="user" element={<User/>}/>
          <Route path="publisher" element={<Publisher/>}/>
          <Route path="admin" element={<Admin/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
