import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chatbot from "./components/chatbot";
import { useEffect,useState } from "react";

const App: React.FC = () => {
  const currentUrl = window.location.href;
  const url_id = currentUrl.split('/').at(-1)
 
  const [data, setData] = useState<{ Name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!url_id) return; 

      try {
        const response = await fetch(`https://api.kontactly.ai/Project_Data_Train_descp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: url_id }),
        });
      
        console.log("API Response:", response);
      
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      
        const result = await response.json();
        console.log("Fetched Data:", result);
        setData(result.Name);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      
    };

    fetchData();
  }, [url_id]);



  return (
    
    <Router>
      <Routes>
        <Route path="/:id" element={<Chatbot url={data} />} />
      </Routes>
    </Router>
  );
};

export default App;

