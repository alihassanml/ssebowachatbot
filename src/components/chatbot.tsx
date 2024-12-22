import { useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import qs from "qs";
import ReactMarkdown from "react-markdown";

import { Button, Image, Row, Col } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { TypeAnimation } from "react-type-animation";

const Chatbot = ({ url }) => {
  const [projectData, setProjectData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [welcomeshow, setwelcomeshow] = useState(true);
  const [userInput, setUserInput] = useState("");

  const [contactInput, setContactInput] = useState("");
  const [contactmessages, setContactmessages] = useState([]);
  const [messages, setMessages] = useState([]);

  const [Contactmode, setContactmode] = useState(false);
  const [Chatmode, setChatmode] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("name");
  const [userrole, setuserrole] = useState("user");

  const [userData, setUserData] = useState(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    return storedData || { name: "", email: "", message: "" };
  });
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("userData");
    };

    // Attach the event listener
    window.addEventListener("beforeunload", handleUnload);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const [activeStatusUser, setActiveStatusUser] = useState(false);

  const inputRef = useRef(null);
  const fetchProjectData = async () => {
    try {
      const response = await axios.post(
        `https://api.kontactly.ai/Project_Description_Find?id=${url}`
      );

      if (response.status === 200) {
        setProjectData(response.data);
        console.log(response.data);
        setAdminEmail(response.data.email);
      } else {
        console.error("Failed to fetch project data:", response);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const checkActiveStatus = async () => {
    const url = `https://api.kontactly.ai/get-message/?admin_email=${adminEmail}&user_email=${userData.email}`;
    try {
      const response = await fetch(url, { method: "POST" });
      if (!response.ok) {
        console.error("Failed to fetch API:", response.statusText);
        return;
      }
      const data = await response.json();
      console.log("API Response:", userData.email);

      if (data.Message === "Connection not active.") {
        setActiveStatusUser(false);
        return false;
      } else {
        setActiveStatusUser(true);
        setContactmessages([
          {
            type: "system",
            text: "Connection active! You're now chatting with our support admin.",
          },
        ]);
        return true;
      }
    } catch (error) {
      console.error("Error fetching API:", error);
      setActiveStatusUser(false);
      return false;
    }
  };

  const switchContactMode = async () => {
    setChatmode(false);
    setContactmode(true);

    if (!userData.name || !userData.email) {
      if (contactmessages.length === 0) {
        // Add messages only once
        setContactmessages([
          {
            type: "system",
            text: "Please provide your contact information to ensure we can reconnect in case of disconnection.",
          },
          { type: "system", text: "What is your name?" },
        ]);
      }
      setCurrentPrompt("name");
    } else {
      const activ = await checkActiveStatus();

      if (activ) {
        console.log("connection successfully!");
      } else {
        setContactmessages([
          {
            type: "system",
            text: "Welcome back! Trying to reconnect with an admin...",
          },
        ]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!userInput) return;
    setShowButtons(false);

    setMessages((prev) => [...prev, { type: "user", text: userInput }]);
    if (userInput.trim()) {
      setUserInput("");
    }

    try {
      // Send user input to chatbot API
      const response = await axios.post(
        "https://api.kontactly.ai/chat",
        qs.stringify({
          question: userInput,
          vector_name: url,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        }
      );

      const answer = response.data.answer;

      if (
        response.data.answer.toLowerCase().includes("false") ||
        response.data.answer.toLowerCase().includes("sorry")
      ) {
        setShowButtons(true);

        setMessages((prev) => [
          ...prev,
          {
            type: "chatbot",
            component: (
              <>
                <div
                  style={{ textAlign: "left", marginTop: "10px" }}
                  className="left-resonse "
                >
                  <button
                    style={{
                      fontSize: "14px",
                      color: "black",
                      fontWeight: "lighter",
                      border:"none",
                      backgroundColor:"transparent",
                      textAlign:"left"
                    }}
                  >
                    Would you like to talk to our customer
                    support center?
                  </button>
                </div>
              </>
            ),
          },
        ]);
      } else {
        setShowButtons(false);
        setMessages((prev) => [...prev, { type: "chatbot", text: answer }]);
      }
    } catch (error) {
      console.error(
        "Error sending message to chatbot:",
        error.response || error.message
      );
      setMessages((prev) => [
        ...prev,
        { type: "chatbot", text: "Error: Unable to get a response." },
      ]);
    }
    setUserInput("");
  };

  useEffect(() => {
    if (url) {
      fetchProjectData();
    }
  }, [url]);

  const toggleChatbot = () => {
    setShowChatbot((prev) => !prev);
    setwelcomeshow(false);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const chatBoxRef = useRef(null);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendAdminNotification = async ({ name, user_email, message }) => {
    const url = `https://api.kontactly.ai/notification/?admin_email=${adminEmail}&name=${encodeURIComponent(
      name
    )}&user_email=${encodeURIComponent(
      user_email
    )}&message=${encodeURIComponent(message)}`;

    try {
      const response = await fetch(url, { method: "POST" });

      if (response.ok) {
        console.log("Notification sent successfully!");
      } else {
        console.error("Failed to send notification.");
        setContactmessages((prev) => [
          ...prev,
          { type: "system", text: "Failed to send notification." },
        ]);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setContactmessages((prev) => [
        ...prev,
        { type: "system", text: "Error sending notification." },
      ]);
    }
  };

  const sendLiveRequest = async ({ name, user_email, message }) => {
    const url = `https://api.kontactly.ai/user_connect/?admin_email=${adminEmail}&name=${encodeURIComponent(
      name
    )}&user_email=${encodeURIComponent(
      user_email
    )}&message=${encodeURIComponent(message)}`;

    try {
      const response = await fetch(url, { method: "POST" });

      if (response.ok) {
        console.log("Notification sent successfully!");
      } else {
        console.error("Failed to send notification.");
        setContactmessages((prev) => [
          ...prev,
          { type: "system", text: "Failed to send Live Request." },
        ]);
      }
    } catch (error) {
      console.error("Error sending Live Request:", error);
      setContactmessages((prev) => [
        ...prev,
        { type: "system", text: "Error sending Live Request." },
      ]);
    }
  };

  // --------------------------------------// handle contact /--------------------------------

  useEffect(() => {
    if (Contactmode && !activeStatusUser) {
      const interval = setInterval(async () => {
        await checkActiveStatus(); // Call the async function
      }, 2000);

      return () => clearInterval(interval); // Cleanup on unmount or dependency change
    }
  }, [Contactmode, activeStatusUser]); // Dependencies

  const [apiData, setApiData] = useState([]);

  const fetchMessage = async (admin, user) => {
    try {
      const response = await fetch(
        `https://api.kontactly.ai/get-message/?admin_email=${admin}&user_email=${user}`,
        {
          method: "POST", // Changed to GET
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch message");
      }

      const data = await response.json();
      const messagesArray = data.messages.map((msg) => ({
        text: msg.message,
        type: msg.role,
      }));
      setApiData(messagesArray);
      console.log(messagesArray);
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };



  const fetchliverequestaccept = async (admin, user) => {
    const url = `https://api.kontactly.ai/check-status/?admin_email=${admin}&user_email=${user}`;
    try {
      const response = await fetch(url, { method: "POST" });
      if (!response.ok) {
        console.error("Failed to fetch API:", response.statusText);
        return;
      }
      const data = await response.json();
      console.log("API Response-----:", data.Message);
  
      if (data.Message === "yes") {
        if (!activeStatusUser) { // Only update state if not already active
          setActiveStatusUser(true);
          fetchMessage(admin,user)
          setContactmessages([
            {
              type: "system",
              text: "Connection active! You're now chatting with our support admin.",
            },
          ]);
          clearFetchingInterval(); 
          checkActiveStatus()
        }
      } else {
        console.log("No active connection.");
      }
    } catch (error) {
      console.error("Error fetching API:", error);
      setActiveStatusUser(false);
    }
  };
  
  useEffect(() => {
    let interval;
  
    const clearFetchingInterval = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  
    if (adminEmail && userData.email ) {
      interval = setInterval(() => {
        fetchliverequestaccept(adminEmail, userData.email);
      }, 2000);
    }
  
    return () => clearFetchingInterval(); 
  }, [adminEmail, userData.email, activeStatusUser, Contactmode]);
  
  
  




  useEffect(() => {
    let interval;
    if (adminEmail && userData.email && activeStatusUser && Contactmode) {
      interval = setInterval(() => {
        fetchMessage(adminEmail, userData.email);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [adminEmail, userData.email, activeStatusUser, Contactmode]);




  const updateMessage = async (contactInput: string) => {
    try {
      const response = await fetch(
        `https://api.kontactly.ai/update-message/?admin_email=${adminEmail}&user_email=${userData.email}&role=${userrole}&new_message=${contactInput}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_email: adminEmail, // Corrected variable name
            user_email: userData.email, // Corrected variable name
            new_message: contactInput,
            role: userrole, // Using the userrole variable as per your original code
          }),
        }
      );

      if (response.ok) {
        console.log("Message updated successfully");
      } else {
        console.error("Error updating message:", await response.text());
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleContactMessage = async () => {
    inputRef.current.focus();
    if (!contactInput.trim()) return;

    if (!userData.name || !userData.email || !userData.message) {
      if (currentPrompt === "name") {
        setUserData((prev) => ({ ...prev, name: contactInput }));
        setContactmessages((prev) => [
          ...prev,
          { type: "user", text: contactInput },
          { type: "system", text: "What is your email?" },
        ]);
        setCurrentPrompt("email");
      } else if (currentPrompt === "email") {
        setUserData((prev) => ({ ...prev, email: contactInput }));
        setContactmessages((prev) => [
          ...prev,
          { type: "user", text: contactInput },
          { type: "system", text: "Please provide your message." },
        ]);
        setCurrentPrompt("message");
      } else if (currentPrompt === "message") {
        setUserData((prev) => ({ ...prev, message: contactInput }));

        console.log("Sending Admin Notification with:", userData);
        sendAdminNotification({
          name: userData.name,
          user_email: userData.email,
          message: contactInput,
        });
        console.log("Sending Live Request with:", userData);
        sendLiveRequest({
          name: userData.name,
          user_email: userData.email,
          message: contactInput,
        });
        setContactmessages((prev) => [
          ...prev,
          { type: "user", text: contactInput },
          {
            type: "system",
            text: "Please hold for a moment while we connect you with our customer support team.",
          },
        ]);
      }
    } else {
      const activ = await checkActiveStatus();
      if (activ) {
        updateMessage(contactInput);
      } else {
        setContactmessages((prev) => [
          ...prev,
          {
            type: "system",
            text: "Waiting, Connection not active!",
          },
        ]);
      }
    }

    setContactInput("");
    inputRef.current.focus();
  };

  const switchChatMode = () => {
    setChatmode(true);
    setContactmode(false);
  };

  const chatContainerRef = useRef(null); // Create a reference to the chat container

  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    if (chatContainer) {
      const isNearBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop <=
        chatContainer.clientHeight + 50; // Buffer of 50px for user comfort

      if (isNearBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll only when near bottom
      }
    }
  }, [contactmessages, apiData]);




  useEffect(() => {
    if (Chatmode && messages.length === 0 && projectData?.welcome_message) {
      setMessages([{ type: "chatbot", text: projectData.welcome_message }]);
    }
  }, [Chatmode, projectData]);

  const cleanMarkdown = (text) => {
    return text.replace(/\n+/g, " ").trim(); // Replace multiple newlines with a single space
  };



 

  return (
    <>
      <Container className="" fluid style={{ backgroundColor: "transparent" }}>
        {projectData && (
          <Button
            className="position-fixed main-chatbot-button"
            style={{
              bottom: "25px",
              right: "20px",
              borderRadius: "10px",
              width: "140px",
              height: "45px",
              backgroundColor: `${projectData.toggle_color}`,
              border: "1px solid rgb(253, 248, 248)",
              fontFamily: "sans-serif",
              boxShadow: "0px 10px 8px rgba(255, 250, 250, 0.14)",
              transition:"all 0.2s ease-out",
            }}
            onClick={toggleChatbot}
          >
            <Image
              src={projectData.logo_name}
              alt={`${projectData.chatbot_name} logo`}
              className="chatbot-logo-image"
              style={{
                width: "30px",
                height: "30px",
                marginRight: "5px", // Optional: Add space between the image and text
              }}
            />
            Let's Chat
          </Button>
        )}

        {projectData &&
          (showChatbot ? (
            Chatmode ? (
              <div
                className="p-0"
                style={{
                  position: "fixed",
                  bottom: "75px",
                  right: "20px",
                  backgroundColor: "rgb(231, 228, 228)",
                  minWidth: "400px",
                  maxWidth: "400px",
                  minHeight: "75vh",
                  maxHeight: "75vh",
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.36)",
                  padding: "20px",
                  overflowY: "auto",
                  opacity: showChatbot ? 1 : 0, // Fade-in/fade-out effect
                  transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                  transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                  margin: 0,
                  border:"1px solid white",
                }}
              >
                <header
                  className="chatbot-1st-header d-flex "
                  style={{
                    backgroundColor: `${projectData.color}`,
                    border: "1px solid `${projectData.color}`",
                  }}
                >
                  <Col
                    style={{
                      margin: 0,
                      padding: "0",
                      flex: "0 0 25%",
                      textAlign: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src={projectData.logo_name}
                      alt={`${projectData.chatbot_name} logo`}
                      className="mt-4"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        marginRight: "5px",
                      }}
                    />
                  </Col>
                  <Col
                    style={{ margin: 0, padding: 0, flex: "0 0 60%" }}
                    className="pt-3"
                  >
                    <h1
                      className="mt-2"
                      style={{ fontSize: "25px", fontWeight: "bold" }}
                    >
                      {capitalizeFirstLetter(projectData.chatbot_name)}
                    </h1>
                    <h6 style={{ fontSize: "15px" }}>
                      {capitalizeFirstLetter(projectData.description)}
                    </h6>
                  </Col>
                  <Col
                    style={{ margin: 0, padding: 0, flex: "0 0 15%" }}
                    className="d-flex"
                  >
                    <h3 className="mt-1 ms-4" onClick={toggleChatbot}>
                      <i
                        className="fa-solid fa-xmark"
                        style={{ cursor: "pointer" }}
                      ></i>
                    </h3>
                  </Col>
                </header>

                <div
                  className="chatbot-mid-scroll p-2"
                  ref={chatBoxRef}
                  style={{ backgroundColor: "rgb(231, 228, 228)" }}
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={
                        message.type === "user"
                          ? "user-message"
                          : "chatbot-message"
                      }
                      style={{
                        textAlign: message.type === "user" ? "right" : "left",
                        margin: "5px 0",
                      }}
                    >
                      <strong>
                        {message.type === "user" ? (
                          <button
                            className="left-resonse-left"
                            style={{
                              backgroundColor: projectData.color,
                              color: "",
                            }}
                          >
                            {capitalizeFirstLetter(message.text)}
                          </button>
                        ) : message.component ? (
                          message.component
                        ) : (
                          <button
                            className="left-resonse-right"
                            style={{ color: "black !important" }}
                          >
                            <ReactMarkdown
                              className="markdown-content"
                              components={{
                                p: ({ children }) => <>{children}</>, 
                              }}
                            >
                              {cleanMarkdown(
                                capitalizeFirstLetter(message.text)
                              )}
                            </ReactMarkdown>
                          </button>
                        )}
                      </strong>
                    </div>
                  ))}

                  {/* Conditional Buttons outside the loop */}
                  {showButtons && (
                    <div style={{ marginTop: "10px", textAlign: "center" }}>
                      <button
                        style={{
                          margin: "1px",
                          padding: "4px 20px",
                          backgroundColor: `${projectData.color}`,
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setShowButtons(false);
                          switchContactMode();
                        }}
                      >
                        Yes
                      </button>
                      <button
                        style={{
                          margin: "1px",
                          padding: "4px 20px",
                          backgroundColor: `${projectData.color}`,
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setShowButtons(false);
                          setChatmode(true);
                          setContactmode(false);
                        }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>

                <div className="chatbot-footer">
                  <InputGroup className="pt-2 ps-2 pe-2">
                    <Form.Control
                      as={"textarea"}
                      placeholder=""
                      aria-describedby="basic-addon2"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage(); // Handle the "Enter" key action
                          e.target.blur(); // Remove focus from the input field
                        }
                      }}
                      className="chatbot-text-input"
                      style={{
                        minHeight: "50px",
                        maxHeight: "150px",
                        outline: "none",
                        overflowY: "hidden",
                        boxShadow: "0px 4px 0px rgba(143, 143, 143, 0.25)",
                        borderTop: "1px solid rgb(112, 111, 111)",
                        borderBottom: "1px solid rgb(112, 111, 111)",
                        borderLeft: "1px solid rgb(112, 111, 111)",
                        borderRight: "1px solid transparent",
                        paddingTop: "16px",
                        paddingBottom: "3px",
                        backgroundColor: "transparent",
                        lineHeight: "16px",
                        resize: "none",
                        color: "rgb(31, 30, 30)",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                    />

                    <InputGroup.Text
                      id="basic-addon2"
                      onClick={handleSendMessage}
                      className="chatbot-send-buttom no-resize"
                      style={{
                        borderTop: "1px solid rgb(112, 111, 111)",
                        borderRight: "1px solid rgb(112, 111, 111)",
                        borderBottom: "1px solid rgb(112, 111, 111)",
                        boxShadow: "0px 4px 0px rgba(143, 143, 143, 0.25)",
                        color:`${projectData.color}`,
                        borderLeft: "none",
                        backgroundColor: "transparent",
                      }}
                    >
                      {userInput.trim() && ( 
                      <i className="fa-solid fa-paper-plane " style={{color:`${projectData.color}`}}></i>
                      )}
                    </InputGroup.Text>
                  </InputGroup>

                  <center>
                    <p className="text-black pt-1" style={{ fontSize: "13px" }}>
                      <Image
                        src="logo.png"
                        alt=""
                        className=""
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          marginRight: "5px",
                        }}
                      />
                      Powerd by{" "}
                      <a
                        href="https://kontactly.ai/"
                        target="__blank"
                        className="text-black"
                      >
                        kontactly.ai
                      </a>
                    </p>
                  </center>
                </div>
              </div>
            ) : Contactmode ? (
              <div
                className="p-0"
                style={{
                  position: "fixed",
                  bottom: "75px",
                  right: "20px",
                  backgroundColor: "rgb(231, 228, 228)",
                  minWidth: "400px",
                  maxWidth: "400px",
                  minHeight: "75vh",
                  maxHeight:"75vh",
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  padding: "20px",
                  overflowY: "hidden",
                  opacity: showChatbot ? 1 : 0, // Fade-in/fade-out effect
                  transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                  transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                  margin: 0,
                  border:"1px solid white",

                }}
              >
                <header
                  className=" d-flex "
                  style={{ backgroundColor: `${projectData.color}`,height:"75px" }}
                >
                  <Col
                    style={{ margin: 0, padding: 0, flex: "0 0 15%" }}
                    className=""
                  >
                    <h3 className=" ms-4" onClick={switchChatMode} style={{paddingTop:"22px"}}>
                      <i
                        className="fa-solid fa-arrow-right"
                        style={{
                          cursor: "pointer",
                          transform: "rotate(180deg)",
                        }}
                      ></i>
                    </h3>
                  </Col>
                  <Col
                    style={{
                      margin: 0,
                      padding: "0",
                      flex: "0 0 60%",
                      textAlign: "center",
                      alignItems: "center",
                    }}
                  >
                    <h2
                      className=" ps-4"
                      style={{ fontWeight: "bold", fontSize: "25px",paddingTop:"22px" }}
                    >
                      {capitalizeFirstLetter(projectData.chatbot_name)}
                    </h2>
                  </Col>

                  <Col
                    style={{ margin: 0, padding: 0, flex: "0 0 15%" }}
                    className="d-flex"
                  >
                    <i
                      className="fa-solid fa-phone "
                      style={{
                        paddingTop: "26px",
                        fontSize: "23px",
                        // transform: "rotate(180deg)",
                        marginLeft: "30px",
                      }}
                    ></i>
                  </Col>
                </header>

                {/* mids contact chat */}

                <div
                  className=" chatbot-mid-scroll p-2"
                  ref={chatContainerRef}
                  style={{minHeight:"53vh"}}
                  
                >
                  {contactmessages.map((message, index) => (
                    <div
                      key={index}
                      className={
                        message.type === "user"
                          ? "user-message"
                          : "chatbot-message"
                      }
                      style={{
                        textAlign: message.type === "user" ? "right" : "left",
                        margin: "5px 0",
                      }}
                    >
                      <strong>
                        {message.type === "user" ? (
                          <button
                            className="left-resonse-left"
                            style={{
                              backgroundColor: projectData.color,
                              color: "white",
                            }}
                          >
                            {capitalizeFirstLetter(message.text)}
                          </button>
                        ) : (
                          <button
                            className="left-resonse-right"
                            style={{ color: "black" }}
                          >
                            {capitalizeFirstLetter(message.text)}
                          </button>
                        )}
                      </strong>
                    </div>
                  ))}

                  {apiData.map((message, index) => (
                    <div
                      key={index}
                      className={
                        message.type === "user"
                          ? "user-message"
                          : "chatbot-message"
                      }
                      style={{
                        textAlign: message.type === "user" ? "right" : "left",
                        margin: "5px 0",
                      }}
                    >
                      <strong>
                        {message.type === "user" ? (
                          <button
                            className="left-resonse-left"
                            style={{
                              backgroundColor: projectData.color,
                              color: "white",
                            }}
                          >
                            {capitalizeFirstLetter(message.text)}
                          </button>
                        ) : (
                          <button
                            className="left-resonse-right"
                            style={{ color: "black " }}
                          >
                            {capitalizeFirstLetter(message.text)}
                          </button>
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* bottom  */}
                <div
                  className=""
                  style={{
                    bottom: "0",
                    position: "fixed",
                    width: "100%",
                    maxHeight: "70px",
                    minHeight: "70px",
                    backgroundColor: "rgb(231, 228, 228)",
                  }}
                >
                  <InputGroup className="  ps-2 pe-2">
                    <Form.Control
                      placeholder=""
                      // as="textarea"
                      ref={inputRef}
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey)
                          handleContactMessage();
                      }}
                      className="chatbot-text-input"
                      style={{
                        minHeight: "50px",
                        outline: "none",
                        border: "1px solid black",
                        borderRight: "none",
                        // paddingTop: "12px",
                        backgroundColor: "rgb(231, 228, 228)",
                        // lineHeight: "11px",
                        boxShadow: "0px 4px 0px rgba(143, 143, 143, 0.25)",
                        // paddingBottom: "5px !important",
                        resize: "none",
                      }}
                    />
                    <InputGroup.Text
                      id="basic-addon2"
                      onClick={handleContactMessage}
                      className="chatbot-send-buttom no-resize"
                      style={{
                        border: "1px solid black",
                        boxShadow: "0px 4px 0px rgba(143, 143, 143, 0.25)",
                        borderLeft: "none",
                        backgroundColor: "rgb(231, 228, 228)",
                      }}
                    >
                      {contactInput.trim() && ( 
                      <i className="fa-solid fa-paper-plane "  style={{color:`${projectData.color}`}}></i>
                      )}
                    </InputGroup.Text>
                  </InputGroup>

                  <center>
                    <p className="text-black pt-1" style={{ fontSize: "13px" }}>
                      <Image
                        src="logo.png"
                        alt=""
                        className=""
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          marginRight: "5px",
                        }}
                      />
                      Powerd by{" "}
                      <a
                        href="https://kontactly.ai/"
                        target="__blank"
                        className="text-black"
                      >
                        kontactly.ai
                      </a>
                    </p>
                  </center>
                </div>
              </div>
            ) : (
              <div>No mode enabled.</div>
            )
          ) : welcomeshow ? (
            <div
              style={{
                position: "fixed",
                bottom: "95px",
                right: "20px",
                backgroundColor: "#f1f1f1",
                minWidth: "10px",
                maxWidth: "450px",
                minHeight: "10px",
                maxHeight: "139px",
                borderRadius: "5px",
                boxShadow: "0 0px 6px rgba(0, 0, 0, 0.44)",
                overflowY: "auto",
                color: "black",
                paddingTop: "15px",
                paddingLeft: "15px",
                paddingRight: "10px",

                opacity: 1,
                transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                // display:`${welcomeshow ? "":"none"}`
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex" }}>
                <h3
                  className=""
                  onClick={() => setwelcomeshow(false)}
                  style={{
                    right: "4px",
                    top: "0px",
                    fontSize: "20px",
                    position: "fixed",
                    color: "gray",
                  }}
                >
                  <i
                    className="fa-solid fa-xmark"
                    style={{ cursor: "pointer", color: "black" }}
                  ></i>
                </h3>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  // paddingTop: "7%",
                  color: "black",
                }}
                className=""
              >
                <TypeAnimation
                  sequence={[
                    `${projectData.welcome_message}`, // The text to type
                    2000, // Pause for 2 seconds after typing
                  ]}
                  speed={75} // Typing speed (lower is slower)
                  wrapper="p" // HTML element wrapper (like <p>)
                  style={{
                    fontSize: "14px",
                    color: "black",
                  }}
                />
              </p>
            </div>
          ) : (
            <div
              style={{
                position: "fixed",
                bottom: "95px",
                right: "20px",
                overflowY: "auto",
                opacity: 1,
                transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                // display:`${welcomeshow ? "":"none"}`
              }}
            ></div>
          ))}
      </Container>
    </>
  );
};

export default Chatbot;
