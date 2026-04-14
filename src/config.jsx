// src/config.js
const SERVER_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://xclass-meeting.herokuapp.com";

export default SERVER_URL;