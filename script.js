const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbzECd2RMjqWMYmaXiq53FmS5lzDl0KOxx8uXd2h4nWQ5CHpbW1iV1-M71ewl-aHMBk4/exec";


let currentUserId = "";

let currentKeyData = null;

let currentKeyAction = "";


/* =========================================================
   API BRIDGE
========================================================= */

async function apiCall(action, data = {}) {

  try {

    const response = await fetch(

      GAS_API_URL,

      {

        method: "POST",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body: JSON.stringify({

          action,

          ...data

        })

      }

    );


    return await response.json();


  } catch (error) {

    console.error(error);

    return {

      success: false,

      message:
        "Unable to connect to the server."

    };

  }

}


/* =========================================================
   PAGE STARTUP
========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  function () {

    const savedUserId =
      localStorage.getItem(
        "spareKeyUserId"
      );


    if (savedUserId) {

      document.getElementById(
        "userId"
      ).value =
        savedUserId;

      document.getElementById(
        "rememberMe"
      ).checked =
        true;

    }

  }

);


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function togglePassword() {

  const password =
    document.getElementById(
      "password"
    );


  password.type =
    password.type === "password"
      ? "text"
      : "password";

}


function toggleUpdatePassword(
  inputId,
  element
) {

  const input =
    document.getElementById(
      inputId
    );


  input.type =
    input.type === "password"
      ? "text"
      : "password";

}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser() {

  const userId =
    document.getElementById(
      "userId"
    ).value.trim();


  const password =
    document.getElementById(
      "password"
    ).value;


  const message =
    document.getElementById(
      "loginMessage"
    );


  const button =
    document.getElementById(
      "loginButton"
    );


  message.textContent = "";


  if (!userId || !password) {

    message.textContent =
      "Please enter User ID and Password.";

    message.className =
      "error-message";

    return;

  }


  button.disabled = true;

  button.textContent =
    "Logging in...";


  const result =
    await apiCall(

      "loginUser",

      {

        userId,

        password

      }

    );


  button.disabled = false;

  button.textContent =
    "Login";


  if (!result.success) {

    message.textContent =
      result.message ||
      "Invalid User ID or Password.";

    message.className =
      "error-message";

    return;

  }


  currentUserId =
    result.userId ||
    userId;


  if (

    document.getElementById(
      "rememberMe"
    ).checked

  ) {

    localStorage.setItem(

      "spareKeyUserId",

      userId

    );

  } else {

    localStorage.removeItem(

      "spareKeyUserId"

    );

  }


  document.getElementById(
    "welcomeUser"
  ).textContent =
    currentUserId;


  document.getElementById(
    "loginScreen"
  ).style.display =
    "none";


  document.getElementById(
    "searchScreen"
  ).style.display =
    "block";


  document.getElementById(
    "message"
  ).textContent = "";

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

  currentUserId = "";

  currentKeyData = null;

  currentKeyAction = "";


  document.getElementById(
    "searchScreen"
  ).style.display =
    "none";


  document.getElementById(
    "loginScreen"
  ).style.display =
    "block";


  document.getElementById(
    "password"
  ).value =
    "";


  document.getElementById(
    "vehicleNumber"
  ).value =
    "";


  document.getElementById(
    "results"
  ).innerHTML =
    "";


  document.getElementById(
    "message"
  ).textContent =
    "";

}


/* =========================================================
   SEARCH VEHICLE
========================================================= */

async function searchVehicle() {

  const vehicleNumber =
    document.getElementById(
      "vehicleNumber"
    ).value.trim();


  const message =
    document.getElementById(
      "message"
    );


  const results =
    document.getElementById(
      "results"
    );


  const button =
    document.getElementById(
      "searchButton"
    );


  results.innerHTML = "";

  message.textContent = "";


  if (!vehicleNumber) {

    message.textContent =
      "Please enter a Vehicle Number.";

    message.className =
      "error-message";

    return;

  }


  button.disabled = true;

  button.textContent =
    "Searching...";


  const result =
    await apiCall(

      "searchVehicle",

      {

        vehicleNumber,

        userId:
          currentUserId

      }

    );


  button.disabled = false;

  button.textContent =
    "Search Spare Key";


  if (!result.success) {

    message.textContent =
      result.message ||
      "No spare key found.";

    message.className =
      "error-message";

    return;

  }


  message.textContent =
    "Spare key found.";

  message.className =
    "success-message";


  renderResults(
    result.results || []
  );

}


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function renderResults(data) {

  const results =
    document.getElementById(
      "results"
    );


  results.innerHTML = "";


  data.forEach(

    function (item) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "result-card";


      card.innerHTML = `

        <h3>
          Spare Key Found
        </h3>

        <p>
          <strong>Hook #:</strong>
          ${escapeHtml(item.hookNumber)}
        </p>

        <p>
          <strong>Vehicle Number:</strong>
          ${escapeHtml(item.vehicleNumber)}
        </p>

        <p>
          <strong>Vehicle Name:</strong>
          ${escapeHtml(item.vehicleName)}
        </p>

        <div class="result-actions">

          <button
            class="key-in-button"
            onclick='openKeyActionModal(${JSON.stringify(item)}, "Key In")'
          >
            Key In
          </button>

          <button
            class="key-out-button"
            onclick='openKeyActionModal(${JSON.stringify(item)}, "Key Out")'
          >
            Key Out
          </button>

          <button
            class="logs-button"
            onclick='viewSpareKeyLogs(${JSON.stringify(item.hookNumber)})'
          >
            View Logs
          </button>

        </div>

      `;


      results.appendChild(
        card
      );

    }

  );

}


/* =========================================================
   KEY ACTION MODAL
========================================================= */

function openKeyActionModal(
  item,
  action
) {

  currentKeyData =
    item;


  currentKeyAction =
    action;


  document.getElementById(
    "keyActionTitle"
  ).textContent =
    action;


  document.getElementById(
    "keyActionMessage"
  ).textContent =

    "Vehicle: " +
    item.vehicleNumber;


  document.getElementById(
    "keyActionNotes"
  ).value =
    "";


  document.getElementById(
    "keyActionModal"
  ).style.display =
    "block";

}


function closeKeyActionModal() {

  document.getElementById(
    "keyActionModal"
  ).style.display =
    "none";


  currentKeyData = null;

  currentKeyAction = "";

}


async function confirmKeyAction() {

  if (!currentKeyData) {

    return;

  }


  const notes =
    document.getElementById(
      "keyActionNotes"
    ).value.trim();


  const result =
    await apiCall(

      "addKeyLog",

      {

        hookNumber:
          currentKeyData.hookNumber,

        vehicleNumber:
          currentKeyData.vehicleNumber,

        vehicleName:
          currentKeyData.vehicleName,

        actionType:
          currentKeyAction,

        userId:
          currentUserId,

        notes

      }

    );


  if (!result.success) {

    alert(
      result.message ||
      "Unable to record action."
    );

    return;

  }


  closeKeyActionModal();


  alert(
    result.message ||
    "Action recorded successfully."
  );

}


/* =========================================================
   VIEW SPARE KEY LOGS
========================================================= */

async function viewSpareKeyLogs(
  hookNumber
) {

  const result =
    await apiCall(

      "getSpareKeyLogs",

      {

        hookNumber

      }

    );


  if (!result.success) {

    alert(
      result.message ||
      "Unable to load logs."
    );

    return;

  }


  let html =
    "<h3>Spare Key Logs</h3>";


  if (
    !result.logs ||
    result.logs.length === 0
  ) {

    html +=
      "<p>No logs found.</p>";

  } else {

    html +=
      '<div class="log-table-wrapper">';

    html +=
      '<table class="log-table">';

    html += `

      <tr>

        <th>Date</th>

        <th>Action</th>

        <th>Vehicle</th>

        <th>Notes</th>

        <th>User</th>

      </tr>

    `;


    result.logs.forEach(

      function (log) {

        html += `

          <tr>

            <td>
              ${escapeHtml(log.date)}
            </td>

            <td>
              ${escapeHtml(log.actionType)}
            </td>

            <td>
              ${escapeHtml(log.vehicleNumber)}
              <br>
              ${escapeHtml(log.vehicleName)}
            </td>

            <td>
              ${escapeHtml(log.notes)}
            </td>

            <td>
              ${escapeHtml(log.user)}
            </td>

          </tr>

        `;

      }

    );


    html +=
      "</table></div>";

  }


  document.getElementById(
    "results"
  ).innerHTML =
    html;

}


/* =========================================================
   MISSING KEY MODAL
========================================================= */

function openMissingKeyModal() {

  document.getElementById(
    "missingKeyModal"
  ).style.display =
    "block";


  document.getElementById(
    "missingKeyVehicleNumber"
  ).focus();

}


function closeMissingKeyModal() {

  document.getElementById(
    "missingKeyModal"
  ).style.display =
    "none";


  document.getElementById(
    "missingKeyMessage"
  ).textContent =
    "";


  document.getElementById(
    "missingKeyResults"
  ).innerHTML =
    "";

}


function handleMissingKeyEnter(event) {

  if (
    event.key === "Enter"
  ) {

    searchMissingKey();

  }

}


async function searchMissingKey() {

  const vehicleNumber =
    document.getElementById(
      "missingKeyVehicleNumber"
    ).value.trim();


  const message =
    document.getElementById(
      "missingKeyMessage"
    );


  const results =
    document.getElementById(
      "missingKeyResults"
    );


  message.textContent = "";

  results.innerHTML = "";


  if (!vehicleNumber) {

    message.textContent =
      "Please enter a Vehicle Number.";

    message.className =
      "error-message";

    return;

  }


  const result =
    await apiCall(

      "searchMissingKeyHistory",

      {

        vehicleNumber

      }

    );


  if (!result.success) {

    message.textContent =
      result.message ||
      "No records found.";

    message.className =
      "error-message";

    return;

  }


  if (
    !result.logs ||
    result.logs.length === 0
  ) {

    message.textContent =
      result.message ||
      "No records found.";

    message.className =
      "error-message";

    return;

  }


  message.textContent =
    "Records found.";

  message.className =
    "success-message";


  let html =
    '<div class="log-table-wrapper">';

  html +=
    '<table class="log-table">';

  html += `

    <tr>

      <th>Date</th>

      <th>Action</th>

      <th>Hook #</th>

      <th>Notes</th>

      <th>User</th>

    </tr>

  `;


  result.logs.forEach(

    function (log) {

      html += `

        <tr>

          <td>
            ${escapeHtml(log.dateTime)}
          </td>

          <td>
            ${escapeHtml(log.actionType)}
          </td>

          <td>
            ${escapeHtml(log.hookNumber)}
          </td>

          <td>
            ${escapeHtml(log.notes)}
          </td>

          <td>
            ${escapeHtml(log.user)}
          </td>

        </tr>

      `;

    }

  );


  html +=
    "</table></div>";


  results.innerHTML =
    html;

}


/* =========================================================
   UPDATE PASSWORD
========================================================= */

function openUpdatePasswordModal() {

  document.getElementById(
    "updatePasswordModal"
  ).style.display =
    "block";


  document.getElementById(
    "passwordErrorMessage"
  ).textContent =
    "";


  document.getElementById(
    "currentPasswordInput"
  ).value =
    "";


  document.getElementById(
    "newPasswordInput"
  ).value =
    "";


  document.getElementById(
    "currentPasswordInput"
  ).focus();

}


function closeUpdatePasswordModal() {

  document.getElementById(
    "updatePasswordModal"
  ).style.display =
    "none";

}


async function submitUpdatePassword() {

  const currentPassword =
    document.getElementById(
      "currentPasswordInput"
    ).value;


  const newPassword =
    document.getElementById(
      "newPasswordInput"
    ).value;


  const message =
    document.getElementById(
      "passwordErrorMessage"
    );


  if (!currentPassword || !newPassword) {

    message.textContent =
      "Please complete all password fields.";

    return;

  }


  if (
    newPassword.length < 6
  ) {

    message.textContent =
      "New password must contain at least 6 characters.";

    return;

  }


  const result =
    await apiCall(

      "updatePassword",

      {

        userId:
          currentUserId,

        currentPassword,

        newPassword

      }

    );


  if (!result.success) {

    message.textContent =
      result.message ||
      "Password update failed.";

    return;

  }


  alert(
    result.message ||
    "Password updated successfully."
  );


  closeUpdatePasswordModal();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

window.addEventListener(

  "click",

  function (event) {

    const modals =
      document.querySelectorAll(
        ".custom-modal"
      );


    modals.forEach(

      function (modal) {

        if (
          event.target === modal
        ) {

          modal.style.display =
            "none";

        }

      }

    );

  }

);
