import axios from "axios";
import React from "react";
import "./App.css";

type User = {
  login: string;
  password: string;
  token: string;
};

type Detail = {
  id: string;
  name: string;
  [key: string]: any;
};

const App: React.VFC = () => {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  return (
    <div className="App">
      {selectedUser === null ? (
        <UsersList onSelectUser={(user) => setSelectedUser(user)} />
      ) : (
        <UserDetail user={selectedUser} />
      )}
    </div>
  );
};

const UsersList: React.VFC<{ onSelectUser: (user: User) => void }> = (
  props
) => {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<User[]>([]);
  React.useEffect(() => {
    const getUsers = async () => {
      const { data } = await axios.get<User[]>(
        `${import.meta.env.VITE_API_URL}/logins`
      );
      setUsers(data);
      setLoading(false);
    };
    getUsers();
  }, []);
  return loading ? (
    <p>Loading...</p>
  ) : (
    <>
      <h2>Choose your user</h2>
      {users.map((user) => (
        <button
          onClick={() => props.onSelectUser(user)}
          className="Btn-user"
          key={user.login}
        >
          {user.login}
        </button>
      ))}
    </>
  );
};

const UserDetail: React.VFC<{ user: User }> = (props) => {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [details, setDetails] = React.useState<Detail[]>([]);
  const [expendedDetails, setExpendedDetails] = React.useState<Detail["id"][]>(
    []
  );
  React.useEffect(() => {
    const getUserDetails = async () => {
      const { data } = await axios.get<Detail[]>(
        `${import.meta.env.VITE_API_URL}/${props.user.token}`
      );
      setDetails(data);
      setLoading(false);
    };
    getUserDetails();
  }, []);
  return loading ? (
    <p>Loading...</p>
  ) : (
    <div>
      <h2>User {props.user.login} content</h2>
      <input
        type="text"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a content"
        value={search}
      />
      {details
        .filter((detail) =>
          detail.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((detail) => (
          <div key={detail.id}>
            <button
              className="Btn-content"
              onClick={() =>
                setExpendedDetails((expendedDetails) => {
                  if (expendedDetails.includes(detail.id)) {
                    return expendedDetails.filter(
                      (detailId) => detailId !== detail.id
                    );
                  }
                  return [...expendedDetails, detail.id];
                })
              }
            >
              {detail.name}
            </button>
            <div
              className={`Details ${
                expendedDetails.includes(detail.id) ? "" : "Hidden"
              }`}
            >
              <Detail detail={detail} />
            </div>
          </div>
        ))}
    </div>
  );
};

const Detail: React.VFC<{ detail: Detail }> = (props) => {
  const displayValue = (
    value: null | Array<any> | object | string | number | boolean
  ): string | React.ReactElement | React.ReactElement[] => {
    if (value === null) {
      return "null";
    }
    if (Array.isArray(value)) {
      return value.map((nestedValue, index) => (
        <span key={`${props.detail.id}-${index}`}>
          {displayValue(nestedValue)}
        </span>
      ));
    }
    if (typeof value === "object") {
      return (
        <span className="Column">
          {Object.entries(value).map(([key, nestedValue], index) => {
            return (
              <span className="Row" key={`${props.detail.id}-${key}-${index}`}>
                <span className="Header">{key}</span>
                <span>{displayValue(nestedValue)}</span>
              </span>
            );
          })}
        </span>
      );
    }
    return value.toString();
  };
  return <div className="Table">{displayValue(props.detail)}</div>;
};

export default App;
