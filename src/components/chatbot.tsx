import { useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import qs from "qs";

import { Button, Image, Row, Col } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

const Chatbot = ({ url }) => {
  const [projectData, setProjectData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [welcomeshow, setwelcomeshow] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [Contactmode, setContactmode] = useState(false);
  const [Chatmode, setChatmode] = useState(true);

  const fetchProjectData = async () => {
    try {
      const response = await axios.post(
        `https://api.kontactly.ai/Project_Description_Find?id=${url}`
      );

      if (response.status === 200) {
        setProjectData(response.data);
        console.log(response.data);
      } else {
        console.error("Failed to fetch project data:", response);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput) return;

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

      if (response.data.answer === "False") {
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
                  <p
                    style={{
                      fontSize: "14px",
                      color: "black",
                      fontWeight: "lighter",
                    }}
                  >
                    Something went wrong. Do you want to connect with the admin?
                  </p>
                </div>

                <button
                  style={{
                    margin: "5px",
                    padding: "5px 10px",
                    backgroundColor: `${projectData.color}`,
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    alert("yes");
                    setChatmode(false);
                    setContactmode(true);
                  }}
                >
                  Yes
                </button>
                <button
                  style={{
                    margin: "5px",
                    padding: "5px 10px",
                    backgroundColor: `${projectData.color}`,
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // setChatmode(true);
                    //  setContactmode(false);
                    alert("no");
                  }}
                >
                  No
                </button>
              </>
            ),
          },
        ]);
      } else {
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

  return (
    <>
      <Container className="" fluid style={{ backgroundColor: "transparent" }}>
        {projectData && (
          <Button
            className="position-fixed"
            style={{
              bottom: "25px",
              right: "20px",
              borderRadius: "10px",
              width: "140px",
              height: "45px",
              backgroundColor: `${projectData.toggle_color}`,
              border: "none",
              fontFamily: "sans-serif",
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
            (showChatbot ?
              (Chatmode ?(
            

            <div
              className="p-0"
              style={{
                position: "fixed",
                bottom: "75px",
                right: "20px",
                backgroundColor: "gray",
                minWidth: "360px",
                maxWidth: "360px",
                minHeight: "530px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                overflowY: "auto",
                opacity: showChatbot ? 1 : 0, // Fade-in/fade-out effect
                transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                margin: 0,
              }}
            >
              <header
                className="chatbot-1st-header d-flex "
                style={{ backgroundColor: `${projectData.color}` }}
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
                    className="mt-3"
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
                  className="pt-2"
                >
                  <h1
                    className="mt-1"
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
                  <h3 className="mt-2" onClick={toggleChatbot}>
                    <i
                      className="fa-solid fa-minus"
                      style={{ cursor: "pointer" }}
                    ></i>
                  </h3>
                </Col>
              </header>

              <div className="bg-info chatbot-mid-scroll p-2" ref={chatBoxRef}>
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
                          className="left-resonse"
                          style={{
                            backgroundColor: projectData.color,
                            color: "auto",
                          }}
                        >
                          {capitalizeFirstLetter(message.text)}
                        </button>
                      ) : message.component ? (
                        message.component
                      ) : (
                        <button
                          className="left-resonse"
                          style={{ color: "black" }}
                        >
                          {capitalizeFirstLetter(message.text)}
                        </button>
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="chatbot-footer bg-primary">
                <InputGroup className="pt-2 ps-2 pe-2" style={{}}>
                  <Form.Control
                    placeholder=""
                    as="textarea"
                    aria-describedby="basic-addon2"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    className="chatbot-text-input"
                    style={{
                      minHeight: "50px",
                      outline: "none",
                      boxShadow: "0 0 5px transparent",
                      border: "1px solid black",
                      borderRight: "none",
                      paddingTop: "16px",
                      backgroundColor: "green",
                      lineHeight: "16px",
                      paddingBottom: "3px !important",
                      resize: "none",
                    }}
                  />
                  <InputGroup.Text
                    id="basic-addon2"
                    onClick={handleSendMessage}
                    className="chatbot-send-buttom no-resize"
                    style={{
                      border: "1px solid black",
                      borderLeft: "none",
                      backgroundColor: "yellow",
                    }}
                  >
                    <i className="fa-solid fa-paper-plane text-black"></i>
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
           ): Contactmode ?(
            <div
              className="p-0"
              style={{
                position: "fixed",
                bottom: "75px",
                right: "20px",
                backgroundColor: "pink",
                minWidth: "360px",
                maxWidth: "360px",
                minHeight: "530px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                overflowY: "auto",
              }} >
                <header
                className="chatbot-1st-header d-flex "
                style={{ backgroundColor: `${projectData.color}` }}
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
                    className="mt-3"
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
                  className="pt-2"
                >
                  <h1
                    className="mt-2"
                    style={{ fontSize: "25px", fontWeight: "bold" }}
                  >
                    {capitalizeFirstLetter(projectData.chatbot_name)}
                  </h1>
                  <p>online</p>
                  
                </Col>
                <Col
                  style={{ margin: 0, padding: 0, flex: "0 0 15%" }}
                  className="d-flex"
                >
                  <h3 className="mt-2" onClick={() => {
                  setChatmode(true);
                   setContactmode(false);
                  alert("no");
                }}>
                    <i
                      className="fa-solid fa-minus"
                      style={{ cursor: "pointer" }}
                    ></i>
                  </h3>
                </Col>
              </header>


                
            </div>

          ): (
            <div>No mode enabled.</div>
          )):welcomeshow ? (
            <div
              style={{
                position: "fixed",
                bottom: "95px",
                right: "20px",
                backgroundColor: `${projectData.color}`,
                minWidth: "320px",
                maxWidth: "450px",
                minHeight: "110px",
                maxHeight: "139px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                paddingLeft: "20px",
                paddingRight: "20px",
                // paddingTop: "15px",
                overflowY: "auto",
                opacity: 1,
                transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                // display:`${welcomeshow ? "":"none"}`
              }}
            >
              <div style={{ display: "flex" }}>
                <h3
                  className=""
                  onClick={() => setwelcomeshow(false)}
                  style={{
                    right: "14px",
                    position: "fixed",
                  }}
                >
                  <i
                    className="fa-solid fa-minus"
                    style={{ cursor: "pointer" }}
                  ></i>
                </h3>
              </div>
              <p
                style={{
                  fontSize: "15px",
                  paddingTop: "8%",
                }}
                className=""
              >
                {projectData.welcome_message}
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
