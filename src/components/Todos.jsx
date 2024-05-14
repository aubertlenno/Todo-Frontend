import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Todo from "./Todo";

const EditProfileModal = ({ isOpen, onClose, onUpdateProfile }) => {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    setPasswordError("");
    setConfirmPasswordError("");
  }, [isOpen, currentPassword, newPassword, confirmNewPassword]);

  const handleSubmit = () => {
    setPasswordError("");
    setConfirmPasswordError("");

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError(
        "New password and confirm new password must match."
      );
      return;
    }

    onUpdateProfile(
      newUsername,
      currentPassword,
      newPassword,
      setPasswordError,
      setConfirmPasswordError
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <hr className="my-4" />
        <div className="my-4">
          <h3 className="text-sm font-semibold mb-2">Edit Username</h3>
          <input
            className="w-full border rounded p-2"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        <div className="my-2">
          <h3 className="text-sm font-semibold mb-2">Edit Password</h3>
          <input
            type="password"
            className="w-full border rounded p-2 mb-1"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          {passwordError && (
            <p className="text-red-500 text-xs">{passwordError}</p>
          )}
          <input
            type="password"
            className="w-full border rounded p-2 mb-1"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full border rounded p-2 mb-1"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          {confirmPasswordError && (
            <p className="text-red-500 text-xs">{confirmPasswordError}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-base font-semibold py-1.5 px-4 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 text-base font-semibold py-1.5 px-4 rounded"
            onClick={handleSubmit}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const Todos = () => {
  const navigate = useNavigate();
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [editTodo, setEditTodo] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8000/todos/", { withCredentials: true })
      .then((response) => {
        setTodoList(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the todos!", error);
        navigate("/signin");
      });
  }, [navigate]);

  const handleSignOut = () => {
    axios
      .post("http://localhost:8000/logout", {}, { withCredentials: true })
      .then(() => {
        navigate("/signin");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const addEmoji = (e) => {
    const sym = e.unified.split("_");
    const codeArray = [];
    sym.forEach((el) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray);
    setText(text + emoji);
  };

  const addTodo = (e) => {
    e.preventDefault();
    const todo = {
      text,
      completed: false,
      time: new Date().toISOString(),
    };

    if (!editTodo) {
      axios
        .post("http://localhost:8000/todos/", todo, { withCredentials: true })
        .then((response) => {
          setTodoList([...todoList, response.data]);
          setText("");
          setShowEmoji(false);
        })
        .catch((error) => {
          console.error("There was an error adding the todo!", error);
        });
    } else {
      axios
        .put(`http://localhost:8000/todos/${editTodo.id}/update_text/`, null, {
          params: { text: todo.text },
          withCredentials: true,
        })
        .then((response) => {
          setTodoList(
            todoList.map((t) => (t.id === editTodo.id ? response.data : t))
          );
          setEditTodo(null);
          setText("");
          setShowEmoji(false);
        })
        .catch((error) => {
          console.error("There was an error updating the todo!", error);
        });
    }
  };

  const filterTodos = () => {
    switch (filter) {
      case "ongoing":
        return todoList.filter((todo) => !todo.completed);
      case "completed":
        return todoList.filter((todo) => todo.completed);
      default:
        return todoList;
    }
  };

  const handleUpdateProfile = async (
    newUsername,
    currentPassword,
    newPassword,
    setPasswordError,
    setConfirmPasswordError
  ) => {
    setPasswordError("");
    setConfirmPasswordError("");

    try {
      await axios.put(
        "http://localhost:8000/users/update_profile",
        {
          newUsername,
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      setIsEditProfileModalOpen(false);
    } catch (error) {
      if (
        error.response &&
        error.response.data.detail === "Incorrect password"
      ) {
        setPasswordError(
          "The current password is incorrect. Please try again."
        );
      } else {
        console.error("Error updating profile:", error);
        setPasswordError("Error updating profile.");
      }
    }
  };

  return (
    <>
      <div className="pt-3rem w-[90%] sm:w-[70%] md:w-[60%] lg:w-[40%] mx-auto">
        <h1 className="text-2 font-medium text-center capitalize text-[#40513b]">
          ToDo List
        </h1>

        <div className="flex justify-center">
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-1 my-3 font-medium leading-6 text-white text-sm whitespace-no-wrap bg-[#609966] rounded-md shadow-sm hover:bg-[#56895C] focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Edit Profile
          </button>

          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={() => setIsEditProfileModalOpen(false)}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <button
            className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
              filter === "all"
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
              filter === "ongoing"
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("ongoing")}
          >
            Ongoing
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
              filter === "completed"
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        <div>
          <form onSubmit={addTodo} className="flex items-start gap-2 pt-2rem">
            <div className="w-full flex items-end p-2 bg-todo rounded relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="write your text"
                className="w-full bg-transparent outline-none resize-none text-sm"
                cols="30"
                rows="1"
              ></textarea>

              <span
                onClick={() => setShowEmoji(!showEmoji)}
                className="cursor-pointer hover:text-slate-300"
              >
                <BsEmojiSmile />
              </span>

              {showEmoji && (
                <div className="absolute top-[100%] right-2">
                  <Picker
                    data={data}
                    emojiSize={20}
                    emojiButtonSize={28}
                    onEmojiSelect={addEmoji}
                    maxFrequentRows={0}
                  />
                </div>
              )}
            </div>

            <button
              className="flex items-center capitalize gap-2 bg-yellow-200 text-black py-1.5
          px-3 rounded-sm hover:bg-yellow-100"
            >
              <AiOutlinePlus />
              {editTodo ? "update" : "add"}
            </button>
          </form>

          <div className="pt-2rem">
            <Todo
              todoList={filterTodos()}
              setTodoList={setTodoList}
              setEditTodo={setEditTodo}
            />
          </div>
        </div>

        {/* sign out button */}
        <div className="w-full flex items-center justify-center mt-5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Sign out
          </button>
        </div>
      </div>
      <footer className="text-center lg:text-left">
        <div className="p-4 text-center text-surface dark:text-black">
          © 2024 Copyright:&nbsp;
          <a href="https://lennoaubert.blog/" className="underline">
            Lenno Aubert Hartono
          </a>
          &nbsp;-&nbsp;2602116983
        </div>
      </footer>
    </>
  );
};

export default Todos;
