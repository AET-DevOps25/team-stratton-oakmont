import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  TextField,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Link,
  Collapse,
} from "@mui/material";
import {
  Send,
  SmartToy,
  Add,
  Delete,
  Chat,
  History,
  Clear,
  School,
  OpenInNew,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { aiAdvisorAPI } from "../../../api/aiAdvisor";
import { getStudyPlanById } from "../../../api/studyPlans";
import { STUDY_PLAN_API_URL } from "../../../config/api";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  courseCodes?: string[];
  confidence?: number;
  sources?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
  studyPlanContext?: {
    id: string;
    name: string;
  };
}

interface AiChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ isOpen }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();

  // Extract study plan ID from URL path manually since this component
  // is rendered outside of the route component that has the :id parameter
  const extractStudyPlanIdFromPath = () => {
    const pathname = location.pathname;
    const match = pathname.match(/^\/study-plans\/(\d+)$/);
    return match ? match[1] : undefined;
  };

  const studyPlanId = extractStudyPlanIdFromPath();

  // Get study plan ID with fallback to localStorage
  const getStudyPlanId = () => {
    if (studyPlanId) {
      return studyPlanId;
    }
    const storedStudyPlanId = localStorage.getItem("currentStudyPlanId");
    return storedStudyPlanId || undefined;
  };

  const currentStudyPlanId = getStudyPlanId();

  // State for study plan name
  const [currentStudyPlanName, setCurrentStudyPlanName] = useState<
    string | null
  >(null);

  // Fetch study plan name from API
  useEffect(() => {
    const fetchStudyPlanName = async () => {
      if (!currentStudyPlanId) {
        console.log("No study plan ID found, setting name to null");
        setCurrentStudyPlanName(null);
        return;
      }

      console.log("=== STUDY PLAN NAME FETCHING DEBUG ===");
      console.log("Current study plan ID:", currentStudyPlanId);
      console.log("Current pathname:", location.pathname);

      // Check if JWT token exists
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        console.warn("No JWT token found in localStorage");
        setCurrentStudyPlanName(`Study Plan ${currentStudyPlanId}`);
        return;
      }
      console.log("JWT token found:", token.substring(0, 50) + "...");

      // Try to get from localStorage first for performance
      const cachedName = localStorage.getItem(
        `studyPlan_${currentStudyPlanId}_name`
      );

      // Clear incorrect cached values (temporary fix)
      if (cachedName === "My Study Plans") {
        console.log("Clearing incorrect cached name:", cachedName);
        localStorage.removeItem(`studyPlan_${currentStudyPlanId}_name`);
        // Fall through to fetch from API
      } else if (cachedName) {
        console.log("Found cached name:", cachedName);
        setCurrentStudyPlanName(cachedName);

        // Also verify the cached name with the API to ensure it's still correct
        console.log("Verifying cached name with API...");
        try {
          const studyPlan = await getStudyPlanById(currentStudyPlanId);
          if (studyPlan?.name && studyPlan.name !== cachedName) {
            console.log(
              `Cached name "${cachedName}" is outdated. Updating to "${studyPlan.name}"`
            );
            setCurrentStudyPlanName(studyPlan.name);
            localStorage.setItem(
              `studyPlan_${currentStudyPlanId}_name`,
              studyPlan.name
            );

            // Update existing chat sessions with the correct study plan name
            setChatSessions((prevSessions) =>
              prevSessions.map((session) => {
                if (
                  session.studyPlanContext?.id === currentStudyPlanId &&
                  session.studyPlanContext?.name !== studyPlan.name
                ) {
                  console.log(
                    `Updating session ${session.id} with correct study plan name: ${studyPlan.name}`
                  );
                  return {
                    ...session,
                    studyPlanContext: {
                      ...session.studyPlanContext,
                      name: studyPlan.name,
                    },
                  };
                }
                return session;
              })
            );
          }
        } catch (error) {
          console.error("Error verifying cached name:", error);
        }
        return;
      }

      // Fetch from API
      try {
        console.log("Calling API to fetch study plan details...");
        console.log("API URL:", `${STUDY_PLAN_API_URL}/${currentStudyPlanId}`);

        const studyPlan = await getStudyPlanById(currentStudyPlanId);
        console.log("API response received:", studyPlan);

        if (studyPlan?.name) {
          console.log("Setting study plan name to:", studyPlan.name);
          setCurrentStudyPlanName(studyPlan.name);
          // Cache the name for future use
          localStorage.setItem(
            `studyPlan_${currentStudyPlanId}_name`,
            studyPlan.name
          );
          console.log("Name cached successfully");

          // Update existing chat sessions with the correct study plan name
          setChatSessions((prevSessions) =>
            prevSessions.map((session) => {
              if (
                session.studyPlanContext?.id === currentStudyPlanId &&
                session.studyPlanContext?.name !== studyPlan.name
              ) {
                console.log(
                  `Updating session ${session.id} with correct study plan name: ${studyPlan.name}`
                );
                return {
                  ...session,
                  studyPlanContext: {
                    ...session.studyPlanContext,
                    name: studyPlan.name,
                  },
                };
              }
              return session;
            })
          );
        } else {
          console.warn("No name in study plan response, response:", studyPlan);
          setCurrentStudyPlanName(`Study Plan ${currentStudyPlanId}`);
        }
      } catch (error) {
        console.error(
          "Could not fetch study plan name - detailed error:",
          error
        );
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        setCurrentStudyPlanName(`Study Plan ${currentStudyPlanId}`);
      }
      console.log("=== END STUDY PLAN NAME FETCHING DEBUG ===");
    };

    fetchStudyPlanName();
  }, [currentStudyPlanId]);

  // Chat state
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // Sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  const sidebarWidth = 380;

  // Start a new chat when study plan context changes
  useEffect(() => {
    if (activeChatId && currentStudyPlanId) {
      // Check if current session has different context
      const currentSession = chatSessions.find((s) => s.id === activeChatId);
      if (currentSession?.studyPlanContext?.id !== currentStudyPlanId) {
        console.log("Study plan context changed, starting new chat");
        // Reset chat without using startNewChat function to avoid dependency issues
        setActiveChatId(null);
        setCurrentMessages([]);
        setError(null);
      }
    }
  }, [currentStudyPlanId, activeChatId, chatSessions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Real AI response function using the API
  const generateAIResponse = async (
    userMessage: string,
    sessionId?: string
  ): Promise<{
    content: string;
    courseCodes: string[];
    sources: string[];
  }> => {
    try {
      // Get the study plan ID from the current session context or global context
      let contextStudyPlanId = currentStudyPlanId;

      if (sessionId) {
        const session = chatSessions.find((s) => s.id === sessionId);
        if (session?.studyPlanContext) {
          contextStudyPlanId = session.studyPlanContext.id;
        }
      }

      // Pass study plan ID to the backend for context and filtering
      const response = await aiAdvisorAPI.sendMessage(
        userMessage,
        sessionId,
        contextStudyPlanId
      );

      return {
        content: response.response,
        courseCodes: response.module_ids || [],
        sources: [],
      };
    } catch (error) {
      console.error("Error calling AI advisor API:", error);

      // Fallback to mock responses if API is unavailable
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      if (userMessage.toLowerCase().includes("study plan")) {
        return {
          content:
            "I can help you create and optimize your study plan! I can suggest courses, check prerequisites, and ensure you meet all requirements for your degree program. What specific aspect of your study plan would you like assistance with?",
          courseCodes: [],
          sources: [],
        };
      } else if (userMessage.toLowerCase().includes("course")) {
        return {
          content:
            "I have access to the complete TUM course catalog. I can help you find courses that match your interests, check ECTS credits, prerequisites, and scheduling information. What courses are you interested in?",
          courseCodes: [],
          sources: [],
        };
      } else if (userMessage.toLowerCase().includes("prerequisite")) {
        return {
          content:
            "Prerequisites are important for course planning! I can help you check which courses you need to complete before taking advanced modules. Would you like me to check prerequisites for a specific course?",
          courseCodes: [],
          sources: [],
        };
      } else {
        return {
          content:
            "Hello! I'm your AI study advisor for TUM. I can help you with course selection, study planning, prerequisite checking, and academic guidance. How can I assist you today?",
          courseCodes: [],
          sources: [],
        };
      }
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message immediately
    setCurrentMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Generate AI response with enhanced data
      const aiResponseData = await generateAIResponse(
        userMessage.content,
        activeChatId || undefined
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseData.content,
        isUser: false,
        timestamp: new Date(),
        courseCodes: aiResponseData.courseCodes,
        sources: aiResponseData.sources,
      };

      setCurrentMessages((prev) => [...prev, aiMessage]);

      // Create new session if it's the first message
      if (!activeChatId) {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title:
            userMessage.content.length > 30
              ? userMessage.content.substring(0, 30) + "..."
              : userMessage.content,
          messages: [userMessage, aiMessage],
          createdAt: new Date(),
          lastUpdated: new Date(),
          studyPlanContext: currentStudyPlanId
            ? {
                id: currentStudyPlanId,
                name:
                  currentStudyPlanName || `Study Plan ${currentStudyPlanId}`,
              }
            : undefined,
        };

        setChatSessions((prev) => [newSession, ...prev]);
        setActiveChatId(newSession.id);
      } else {
        // Update existing session
        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === activeChatId
              ? {
                  ...session,
                  messages: [...session.messages, userMessage, aiMessage],
                  lastUpdated: new Date(),
                }
              : session
          )
        );
      }
    } catch (err) {
      console.error("Error generating AI response:", err);
      setError("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setCurrentMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveChatId(sessionId);
      setCurrentMessages(session.messages);
      setError(null);
    }
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeChatId === sessionId) {
      setActiveChatId(null);
      setCurrentMessages([]);
    }
  };

  const clearAllChats = () => {
    setChatSessions([]);
    setActiveChatId(null);
    setCurrentMessages([]);
    setError(null);
  };

  const isChatActive = (sessionId: string) => {
    return activeChatId === sessionId;
  };

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={isOpen}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
          backgroundColor: "rgba(15, 15, 15, 0.95)",
          backdropFilter: "blur(10px)",
          borderLeft: "1px solid rgba(100, 108, 255, 0.2)",
          color: "white",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Toolbar /> {/* Space for navbar */}
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: "1px solid rgba(100, 108, 255, 0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SmartToy sx={{ color: "#646cff" }} />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "white",
              }}
            >
              AI Study Advisor
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="New chat">
              <IconButton
                size="small"
                onClick={startNewChat}
                sx={{
                  color: "#646cff",
                  "&:hover": {
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {/* Chat History Section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
          onClick={() => setHistoryExpanded(!historyExpanded)}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <History fontSize="small" />
            Chat History
          </Typography>
          <IconButton
            size="small"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              p: 0.5,
            }}
          >
            {historyExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Collapse in={historyExpanded}>
          {chatSessions.length === 0 ? (
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                px: 1,
                py: 2,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              No chat history yet
            </Typography>
          ) : (
            <List
              sx={{
                pt: 1,
                maxHeight: chatSessions.length > 2 ? "160px" : "auto",
                overflowY: chatSessions.length > 2 ? "auto" : "visible",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(100, 108, 255, 0.5)",
                  borderRadius: "3px",
                  "&:hover": {
                    background: "rgba(100, 108, 255, 0.7)",
                  },
                },
              }}
            >
              {chatSessions.map((session) => (
                <ListItem key={session.id} disablePadding>
                  <ListItemButton
                    disableRipple
                    onClick={() => loadChatSession(session.id)}
                    selected={isChatActive(session.id)}
                    sx={{
                      pl: 2,
                      minHeight: 40,
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      "&:hover": {
                        backgroundColor: "rgba(100, 108, 255, 0.1)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(100, 108, 255, 0.2)",
                        "& .MuiListItemText-primary": {
                          color: "#646cff",
                          fontWeight: 600,
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Chat
                        fontSize="small"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "white",
                            }}
                          >
                            {session.title}
                          </Typography>
                          {session.studyPlanContext && (
                            <Chip
                              label={session.studyPlanContext.name}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(100, 108, 255, 0.2)",
                                color: "#646cff",
                                border: "1px solid rgba(100, 108, 255, 0.3)",
                                fontSize: "0.6rem",
                                height: "18px",
                                maxWidth: "120px",
                                alignSelf: "flex-start",
                                "& .MuiChip-label": {
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  px: 0.5,
                                },
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        "&:hover": {
                          color: "#ff6b6b",
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>
      </Box>
      <Divider sx={{ borderColor: "rgba(100, 108, 255, 0.2)" }} />
      {/* Chat Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages Container */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {currentMessages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              <SmartToy sx={{ fontSize: "4rem", mb: 2, color: "#646cff" }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                AI Study Advisor
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: "250px" }}>
                {currentStudyPlanId
                  ? "I'm here to help with your study plan! I have context about your degree program and can provide personalized course recommendations."
                  : "Ask me about courses, study plans, prerequisites, or any academic guidance you need!"}
              </Typography>
            </Box>
          ) : (
            <>
              {currentMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: message.isUser ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: "80%",
                      backgroundColor: message.isUser
                        ? "#646cff"
                        : "rgba(42, 42, 42, 0.8)",
                      color: "white",
                      borderRadius: message.isUser
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    }}
                  >
                    {message.isUser ? (
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.4,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.content}
                      </Typography>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <Typography
                              variant="body2"
                              sx={{
                                lineHeight: 1.4,
                                marginBottom: 1,
                                "&:last-child": { marginBottom: 0 },
                              }}
                            >
                              {children}
                            </Typography>
                          ),
                          strong: ({ children }) => (
                            <Typography
                              component="span"
                              sx={{ fontWeight: "bold" }}
                            >
                              {children}
                            </Typography>
                          ),
                          ul: ({ children }) => (
                            <Box
                              component="ul"
                              sx={{ paddingLeft: 2, margin: 0 }}
                            >
                              {children}
                            </Box>
                          ),
                          li: ({ children }) => (
                            <Typography
                              component="li"
                              variant="body2"
                              sx={{ lineHeight: 1.4, marginBottom: 0.5 }}
                            >
                              {children}
                            </Typography>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}

                    {/* Show course codes for AI messages */}
                    {!message.isUser &&
                      message.courseCodes &&
                      message.courseCodes.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {message.courseCodes.map((code) => (
                            <Chip
                              key={code}
                              label={code}
                              size="small"
                              icon={<School fontSize="small" />}
                              sx={{
                                backgroundColor: "rgba(100, 108, 255, 0.2)",
                                color: "#646cff",
                                border: "1px solid rgba(100, 108, 255, 0.3)",
                              }}
                            />
                          ))}
                        </Box>
                      )}

                    {/* Show confidence score for AI messages */}
                    {!message.isUser &&
                      message.confidence !== undefined &&
                      message.confidence > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.6,
                            fontSize: "0.65rem",
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          Confidence: {Math.round(message.confidence * 100)}%
                        </Typography>
                      )}

                    {/* Show sources for AI messages */}
                    {!message.isUser &&
                      message.sources &&
                      message.sources.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              fontSize: "0.65rem",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Sources:
                          </Typography>
                          {message.sources.slice(0, 2).map((source, index) => (
                            <Link
                              key={index}
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: "#646cff",
                                fontSize: "0.65rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 0.25,
                                textDecoration: "none",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              <OpenInNew fontSize="inherit" />
                              TUM Course Details
                            </Link>
                          ))}
                        </Box>
                      )}

                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        fontSize: "0.7rem",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {isLoading && (
                <Box
                  sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(42, 42, 42, 0.8)",
                      color: "white",
                      borderRadius: "18px 18px 18px 4px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={16} sx={{ color: "#646cff" }} />
                    <Typography variant="body2">AI is thinking...</Typography>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Alert
              severity="error"
              sx={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "#ff6b6b",
                border: "1px solid rgba(244, 67, 54, 0.2)",
                "& .MuiAlert-icon": { color: "#ff6b6b" },
              }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(100, 108, 255, 0.2)",
            backgroundColor: "rgba(42, 42, 42, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask me about your studies..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 3,
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100, 108, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#646cff",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  fontSize: "0.9rem",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              sx={{
                backgroundColor: "#646cff",
                color: "white",
                "&:hover": {
                  backgroundColor: "#535bf2",
                },
                "&:disabled": {
                  backgroundColor: "rgba(100, 108, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AiChatSidebar;
