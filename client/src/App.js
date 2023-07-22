import React, { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from './components/Home';
import Trash from './components/Trash';
import AllTransactions from './components/AllTransactions';
// import Help from './components/Help';
import Login from './components/Login';
import Register from './components/Register';
import ChangePassword from './components/ChangePassword';
import ForgotPassword from './components/ForgotPassword';
import Navbar from './components/Navbar'
// import Alert from './components/Alert'
import LoadingBar from 'react-top-loading-bar'
function App() {
  let apiServer = "http://localhost:5000";
  // let apiServer = "https://ledgerserver.matrixe.in";
  const [progress, setProgress] = useState(0);
  const [logins, setLogins] = useState({ 'loggedIn': 'no', 'userName': 'none', 'authToken': 'none' });
  // const [alerts, setalerts] = useState({});
  return (
    <BrowserRouter>
      <LoadingBar color='red' progress={progress} onLoaderFinished={() => setProgress(0)} />
      <Navbar logins={logins} setLogins={setLogins} />
      {/* {showAlert && <Alert alertType={alertData.alertType} alertMessage={alertData.alertMessage} />} */}
      <Routes>
        <Route exact path="/" element={<Home apiServer={apiServer} setProgress={setProgress} logins={logins} />} />
        <Route exact path="/trash" element={<Trash apiServer={apiServer} setProgress={setProgress} logins={logins} />} />
        <Route exact path="/all-transactions" element={<AllTransactions apiServer={apiServer} setProgress={setProgress} logins={logins} />} />
        <Route path="/login" element={<Login apiServer={apiServer} setProgress={setProgress} logins={logins} setLogins={setLogins} />} />
        <Route path="/forgot-password" element={<ForgotPassword apiServer={apiServer} setProgress={setProgress} logins={logins} setLogins={setLogins} />} />
        <Route path="/register" element={<Register apiServer={apiServer} setProgress={setProgress} logins={logins} setLogins={setLogins} />} />
        <Route path="/change-password" element={<ChangePassword apiServer={apiServer} setProgress={setProgress} logins={logins} setLogins={setLogins} />} />
        {/* <Route path="/help" element={<Help logins={logins} />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
