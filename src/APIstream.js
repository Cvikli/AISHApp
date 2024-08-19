const API_BASE_URL = 'http://localhost:8002';

export const streamProcessMessage = async (message, onMessage, onDone) => {
  const response = await fetch(`${API_BASE_URL}/stream/process_message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ new_message: message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedContent = '';

  const processChunk = (chunk) => {
    const lines = chunk.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      if (line.startsWith('event:')) {
        buffer += line + '\n';
      } else if (line.startsWith('data:')) {
        buffer += line + '\n\n';
        const event = buffer.match(/^event:\s*(.+)$/m)?.[1];
        const data = buffer.match(/^data:\s*(.+)$/m)?.[1];

        if (event && data) {
          try {
            const parsedData = JSON.parse(data);
            switch (event) {
              case 'message':
                accumulatedContent += parsedData.content;
                onMessage(parsedData.content);
                break;
              case 'done':
                // Use the final content from the 'done' event
                accumulatedContent = parsedData.content;
                onDone(accumulatedContent);
                break;
            }
          } catch (error) {
            console.warn('Error parsing JSON:', error);
            // If JSON parsing fails, we'll treat the data as plain text
            if (event === 'message') {
              accumulatedContent += data;
              onMessage(data);
            } else if (event === 'done') {
              onDone(data);
            }
          }
        }
        buffer = '';
      } else {
        buffer += line + '\n';
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    processChunk(chunk);
  }

  // Process any remaining data in the buffer
  if (buffer.trim() !== '') {
    processChunk(buffer);
  }
};
