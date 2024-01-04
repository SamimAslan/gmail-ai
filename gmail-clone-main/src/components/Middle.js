
import { useState, useEffect } from 'react';
import React from 'react';
import '../App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { List, ListItem, Paper } from "@mui/material";
import star from "../images/star.png";
import refresh from "../images/refresh.png";
import remove from "../images/bin.png";
import yellow from "../images/yellow.png";
import snooze from "../images/snooze.png";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { auth, database } from "../firebase/setup";
import openai from 'openai';

function App(props) {
    const API_KEY = "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";
    const systemMessage = {
        "role": "system", "content": "Sen bir Email okuyucususun, senin görevin sana verilen Email lere positif veya negatif bir cevap mi istiyosun diye sorup ona göre maillere sanki benmissin gibi cevap vermek, senin bir Yapay zeka degilsin, sen bir insan seklinde cevap vermen gerekiyor, eger soruya yanit veremiyorsan insanmis gibi kafandan birseyler salla ve insan gibi cevap ver"
    }
    const [messages, setMessages] = useState([
        {
            message: "Hello, I'm ChatGPT! Ask me anything!",
            sentTime: "just now",
            sender: "ChatGPT"
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (message) => {
        const newMessage = {
            message,
            direction: 'outgoing',
            sender: "user"
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);

        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
    };

    async function processMessageToChatGPT(chatMessages) {
        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant";
            } else {
                role = "user";
            }
            return { role: role, content: messageObject.message }
        });

        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                systemMessage,
                ...apiMessages
            ]
        }

        await fetch("https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            }).then((data) => {
                return data.json();
            }).then((data) => {
                setMessages([...chatMessages, {
                    message: data.choices[0].message.content,
                    sender: "ChatGPT"
                }]);
                setIsTyping(false);
            });
    }

    const [mailData, setMailData] = useState([]);
    const [expandedEmailId, setExpandedEmailId] = useState(null);
    const [hoveredEmailId, setHoveredEmailId] = useState(null);
    const [response, setResponse] = useState('');
    const [prompt, setPrompt] = useState('');

    const deleteMail = async (data) => {
        const userDoc = doc(database, "Users", `${auth.currentUser?.email}`);
        const messageDoc = doc(userDoc, "Inbox", `${data.id}`);
        const starredDoc = doc(userDoc, "Starred", `${data.id}`);
        const snoozedDoc = doc(userDoc, "Snoozed", `${data.id}`);
        try {
            await deleteDoc(starredDoc);
            await deleteDoc(snoozedDoc);
            await deleteDoc(messageDoc);
        } catch (err) {
            console.error(err);
        }
    };

    const getMail = async () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
        console.error("No authenticated user found.");
        return;
    }
    
    const userDoc = doc(database, "Users", userEmail);
    const messageCollection = collection(userDoc, "Inbox");
    
    try {
        const querySnapshot = await getDocs(messageCollection);
        const filteredData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));
        console.log("Fetched emails:", filteredData);
        setMailData(filteredData);
    } catch (err) {
        console.error("Error fetching emails:", err);
    }
};
    const starred = async (data) => {
        const userDoc = doc(database, "Users", `${auth.currentUser?.email}`);
        const messageDoc = doc(userDoc, "Starred", `${data.id}`);
        try {
            await setDoc(messageDoc, {
                email: data

.email,
                sender: data.sender,
                starred: "true",
            });
        } catch (err) {
            console.error(err);
        }
    };

    const snoozed = async (data) => {
        const userDoc = doc(database, "Users", `${auth.currentUser?.email}`);
        const messageDoc = doc(userDoc, "Snoozed", `${data.id}`);
        const snoozeDoc = doc(userDoc, "Inbox", `${data.id}`);
        try {
            await deleteDoc(snoozeDoc);
            await setDoc(messageDoc, {
                email: data.email,
                sender: data.sender,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const toggleEmailDetails = (emailId) => {
        setExpandedEmailId(expandedEmailId === emailId ? null : emailId);
    };

    const handleMouseEnter = (emailId) => {
        setHoveredEmailId(emailId);
    };

    const handleMouseLeave = () => {
        setHoveredEmailId(null);
    };

    const handleGptResponse = async (e) => {
        e.preventDefault();
        openai.apiKey = process.env.REACT_APP_OPENAI_API_KEY;

        try {
            const gptResponse = await openai.Completion.create({
                engine: "gpt-3.5-turbo",
                prompt: prompt,
            });
            setResponse(gptResponse.choices[0].text);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
      const fetchMail = async () => {
        if (!auth.currentUser) {
          console.log("User not authenticated");
          return;
        }
    
        try {
          getMail()
        } catch (err) {
          console.error("Error fetching emails: ", err);
        }
      };
    
      fetchMail();
    }, [auth.currentUser, props.subCollect]);

    return (
        <div className="App">
            <div style={{ position: "relative", height: "800px", width: "700px" }}>
                <MainContainer>
                    <ChatContainer>
                        <MessageList
                            scrollBehavior="smooth"
                            typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
                        >
                            {messages.map((message, i) => {
                                return <Message key={i} model={message} />
                            })}
                        </MessageList>
                        <MessageInput placeholder="Type message here" onSend={handleSend} />
                    </ChatContainer>
                </MainContainer>
            </div>
            <div style={{ marginLeft: "2.9vw", width: "75vw" }}>
                <img
                    src={refresh}
                    style={{
                        width: "1.5vw",
                        height: "1.5vw",
                        marginLeft: "1.5vw",
                        marginTop: "2vw",
                    }}
                    alt="Refresh"
                />
                <List>
                    {mailData.map((data) => (
                        <React.Fragment key={data.id}>
                            <ListItem
                                onClick={() => toggleEmailDetails(data.id)}
                                onMouseEnter={() => handleMouseEnter(data.id)}
                                onMouseLeave={handleMouseLeave}
                                style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    marginLeft: "1.2vw",
                                }}
                            >
                                <img
                                    src={data.starred ? yellow : star}
                                    style={{
                                        width: "1.4vw",
                                        height: "1.4vw",
                                        marginLeft: "1.2vw",
                                    }}
                                    alt="Star"
                                />
                                <span
                                    style={{
                                        fontSize: "1.3vw",
                                        marginLeft: "1.2vw",
                                        fontWeight: "500",
                                    }}
                                >
                                    {data.sender}
                                    <span
                                        style={{
                                            marginLeft: "2vw",
                                            fontWeight: "200",
                                            opacity: 0.5,
                                            fontSize: 20,
                                        }}
                                    >
                                        {data.email.length > 130
                                            ? `${data.email.slice(0, 130)}...`
                                            : data.email}
                                    </span>
                                </span>
                                <img
                                    src={snooze}
                                    style={{
                                        width: "1.3vw",
                                        height: "1.3vw",
                                        cursor: "pointer",
                                        marginLeft: "1.2vw",
                                        visibility: hoveredEmailId === data.id ? "visible" : "hidden",
                                    }}
                                    alt="Snooze"
                                />
                                <img
                                    src={remove}
                                    style={{
                                        width: "1.1vw",
                                        height: "1.1vw",
                                        cursor: "pointer",
                                        marginLeft: "1.2vw",
                                        visibility: hoveredEmailId === data.id ? "visible" : "hidden",
                                    }}
                                    alt="Delete"
                                />
                            </ListItem>
                            {expandedEmailId === data.id && (
                                <Paper
                                    elevation={3}
                                    style={{
                                        padding: "10px",
                                        backgroundColor: "white",
                                        borderTop: "1px solid #EFEFEF",
                                        borderBottom: "1px solid #EFEFEF",
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  marginTop: "10px", 
                  borderRadius: "5px", 
                }}
              >
              
              <p style={{ fontSize: "1.2vw", fontWeight: "bold" }}>
                                        {data.sender}
                                    </p>
                                    <p style={{ fontSize: "1.1vw", marginTop: "5px" }}>{data.email}</p>
                                </Paper>
                            )}
                        </React.Fragment>
                    ))}
                </List>
                <h6 style={{ fontWeight: "400", marginLeft: "28vw", fontSize: "1vw" }}>
                    Terms · Privacy · Program Policies
                </h6>
                <form onSubmit={(e) => handleGptResponse(e)}>
                    <input
                        type="text"
                        placeholder="Ask a question or provide a prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        style={{ width: "70%", padding: "5px" }}
                    />
                    <button type="submit">Get GPT-3 Response</button>
                </form>
                {response && (
                    <div style={{ marginTop: "20px", border: "1px solid #EFEFEF", padding: "10px", borderRadius: "5px" }}>
                        <strong>GPT-3 Response:</strong>
                        <p>{response}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;