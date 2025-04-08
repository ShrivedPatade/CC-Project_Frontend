import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';

const App = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const postResponse = await fetch('/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, k: 3 }),
      });

      const contextArray = await postResponse.json();

      const systemPrompt = `You are an AI chatbot for an educational course platform, tasked with answering user queries about available courses. You will receive a context array containing JSON objects with the three most probable answers, each having a distance score. Select the answer with the lowest distance (most relevant), expand on it, and provide a short, concise, and chatbot-friendly response that clearly explains the information to the user. Ensure your response is clear, informative, and to the point, maintaining a natural conversational tone. Context Array: ${JSON.stringify(contextArray)}\n\n`;

      const formattedChat = chatHistory
        .map((entry) => `User: ${entry.user}\nBot: ${entry.bot}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}${formattedChat}\nUser: ${query}`;

      const geminiResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAF3NuXy07v7euPQGfMSdLfr_8cLIqWUyM',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }], role: 'user' }],
          }),
        }
      );

      const data = await geminiResponse.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response.';

      setChatHistory((prev) => [...prev, { user: query, bot: botResponse }]);
      setQuery('');
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { user: query, bot: 'An error occurred. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          🎓 EduBot - Course Assistant
        </Typography>

        <Box
          ref={chatRef}
          sx={{
            height: 400,
            overflowY: 'auto',
            bgcolor: '#f9f9f9',
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: '1px solid #ddd',
          }}
        >
          {chatHistory.map((msg, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="flex-end">
                <Box
                  sx={{
                    bgcolor: '#e3f2fd',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                    mb: 1,
                  }}
                >
                  <Typography>{msg.user}</Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-start">
                <Box
                  sx={{
                    bgcolor: '#dcedc8',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                  }}
                >
                  <Typography>{msg.bot}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            variant="outlined"
            label="Ask something..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
          />
          <Button
            variant="contained"
            onClick={handleQuery}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default App;
