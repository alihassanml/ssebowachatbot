import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Button,Image,Row,Col } from "react-bootstrap";

const Chatbot = ({ url }) => {
  const [projectData, setProjectData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

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

  useEffect(() => {
    if (url) {
      fetchProjectData();
    }
  }, [url]);

  const toggleChatbot = () => {
    setShowChatbot((prev) => !prev); 
  };



  return (
    <>
      <Container className="" fluid >
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
              fontFamily:"sans-serif",
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
            />Let's Chat
          </Button>
        )}

        {projectData && (
            showChatbot ? (
            <div  className="p-0"
            style={{
                position: "fixed",
                bottom: "75px",
                right: "20px",
                backgroundColor: "gray",
                minWidth: "360px",
                minHeight: "510px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                overflowY: "auto",
                opacity: showChatbot ? 1 : 0,  // Fade-in/fade-out effect
                transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
                margin: 0,
            }}
            >

              <header  className="chatbot-1st-header d-flex "  style={{backgroundColor:`${projectData.color}`}}>
              <Col style={{ margin: 0, padding:"0", flex: "0 0 25%", textAlign: "center",alignItems:"center" }}>
              <Image
              src={projectData.logo_name}
              alt={`${projectData.chatbot_name} logo`}
              className="mt-3"
              style={{
                width: "60px",
                height: "60px",
                borderRadius:"50%",
                marginRight: "5px", 
              }}
            /></Col>
              <Col style={{ margin: 0, padding: 0, flex: "0 0 60%"}} className="pt-2">
              <h1 className="mt-1" style={{fontSize:"28px",fontWeight:"bold"}} >{projectData.chatbot_name}</h1>
              <h6 style={{fontSize:"15px"}}>{projectData.description}</h6>
              </Col>
              <Col  style={{ margin: 0, padding: 0, flex: "0 0 15%" }} className="d-flex">
              <h3 className="mt-2" onClick={toggleChatbot}><i className="fa-solid fa-minus" style={{cursor:"pointer"}} ></i></h3>
              </Col>
              </header>
            
            </div>
          ):(
            <div
            style={{
                position: "fixed",
                bottom: "95px",
                right: "20px",
                backgroundColor: `${projectData.color}`,
                minWidth: "400px",
                maxWidth: "450px",
                minHeight: "110px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                overflowY: "auto",
                opacity: 1,  
                transform: showChatbot ? "translateY(0)" : "translateY(20px)", // Slide in/out effect
                transition: "opacity 0.5s ease, transform 0.5s ease", // Transition properties
            }}
             >
            <h4>{projectData.chatbot_name}</h4>
            <p>{projectData.welcome_message}</p>
            </div>
            ))}

      </Container>
    </>
  );
};

export default Chatbot;
    