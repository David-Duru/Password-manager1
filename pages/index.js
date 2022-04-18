import Head from "next/head";

import { useState } from "react";

export default function Home() {
  const [authorised, setAuthorised] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [passwordStore, setPasswordStore] = useState([]);
  const [userData, setUserData] = useState(undefined);
  const [duplicateUser, setDuplicateUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = ["URL", "PASSWORD", "ACTION"];

  const registerUser = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://sweet-choux-bf1cdc.netlify.app/.netlify/functions/app",
        {
          body: JSON.stringify({
            username: event.target.username1.value,
            password: event.target.password1.value,
            route: "register",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      const result = await res.json();

      if (result.duplicateUser === true) {
        setDuplicateUser(true);
        setAuthorised(false);
        setRegistered(false);
        setLoading(false);
        return;
      }

      if (result.success === true) {
        setDuplicateUser(false);
        setAuthorised(false);
        setRegistered(true);
        setLoading(false);
        return;
      }
      return;
    } catch (err) {
      setLoading(false);
    }
  };

  const logIn = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://sweet-choux-bf1cdc.netlify.app/.netlify/functions/app",
        {
          body: JSON.stringify({
            username: event.target.username2.value,
            password: event.target.password2.value,
            route: "login",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      const result = await res.json();
      setAuthorised(true);
      setUserData(result.data);
      setPasswordStore(result.data.passwordStore);
      setRegistered(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const deleteRecord = async (entry) => {
    setLoading(true);

    const updatedArr = passwordStore.filter(function (obj) {
      return obj.url !== entry.url;
    });

    try {
      const res = await fetch(
        "https://sweet-choux-bf1cdc.netlify.app/.netlify/functions/app",
        {
          body: JSON.stringify({
            username: userData.username,
            passwordStore: updatedArr,
            route: "deleteRecord",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      const result = await res.json();

      setUserData(result.data);
      setPasswordStore(result.data.passwordStore);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const addRecord = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://sweet-choux-b-f1cdc.netlify.app/.netlify/functions/app",
        {
          body: JSON.stringify({
            username: userData.username,
            url: event.target.url.value,
            password: event.target.password.value,
            route: "addRecord",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      const result = await res.json();
      setUserData(result.data);
      setPasswordStore(result.data.passwordStore);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const logout = async () => {
    window.location.reload();
  };

  return (
    <div className="container">
      <Head>
        <title>Password Protect!</title>
        <link rel="icon" href="/favicon.ico" />
        <meta http-equiv="refresh" content="300" />
      </Head>

      {loading ? (
        <h1 className="loading">Loading...</h1>
      ) : (
        <>
          <div className="box-wrapper">
            <h1 className="title">Password Protect</h1>
            {userData && (
              <div>
                <h2 className="h2-title">Authorised as: {userData.username}</h2>
                {userData.passwordStore.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {userData.passwordStore.map((entry, i) => {
                        return (
                          <tr key={i}>
                            <td>{entry.url}</td>
                            <td>
                              <button
                                className="button"
                                data={entry}
                                onClick={() => {
                                  navigator.clipboard.writeText(entry.password);
                                }}
                              >
                                Copy
                              </button>
                            </td>
                            <td>
                              <button
                                className="button"
                                data={entry}
                                onClick={() => deleteRecord(entry)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                <br /> <br />
                <form onSubmit={addRecord} autocomplete="off">
                  <h2 className="h2-title">Add website</h2>
                  <h3 className="h3-title">
                    Url<span className="left-span">Password</span>
                  </h3>
                  <input
                    id="url"
                    name="url"
                    type="text"
                    placeholder="website"
                    autoComplete="off"
                    required
                  />{" "}
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    autoComplete="off"
                    required
                  />{" "}
                  <button type="submit" className="buttonAdd">
                    Add
                  </button>
                </form>
                <br />
                <button onClick={logout} className="buttonAdd">
                  Logout
                </button>
              </div>
            )}
            {registered && (
              <div>
                <h2 className="h2-title">You can now login!</h2>
              </div>
            )}
            {!authorised && (
              <>
                {!registered && (
                  <form onSubmit={registerUser}>
                    {/* <ReactCodeInput type="number" fields={6} /> */}
                    <h2 className="h2-title">Register</h2>
                    <h3 className="h3-title">
                      Username<span className="left-span-login">Password</span>
                    </h3>
                    <input
                      id="username1"
                      name="username1"
                      placeholder="Enter username..."
                      type="text"
                      autoComplete="name"
                      required
                    />{" "}
                    <input
                      id="password1"
                      name="password1"
                      type="password"
                      placeholder="Enter password..."
                      required
                    />{" "}
                    <button type="submit" className="buttonAdd">
                      Register
                    </button>
                  </form>
                )}

                {duplicateUser && (
                  <>
                    <br />
                    <h3 className="h3-title-error">
                      Sorry username already taken
                    </h3>
                  </>
                )}

                <br></br>

                <form onSubmit={logIn}>
                  {/* <ReactCodeInput type="number" fields={6} /> */}
                  <h2 className="h2-title">Sign in</h2>
                  <h3 className="h3-title">
                    Username<span className="left-span-login">Password</span>
                  </h3>
                  <input
                    id="username2"
                    name="username2"
                    placeholder="Enter username..."
                    type="text"
                    autoComplete="name"
                    required
                  />{" "}
                  <input
                    id="password2"
                    name="password2"
                    placeholder="Enter password..."
                    type="password"
                    required
                  />{" "}
                  <button type="submit" className="buttonAdd">
                    Sign in
                  </button>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
