const API_BASE_URL = 'http://localhost:8002';

export const streamProcessMessage = async (message, conversation_id, onMessage, user_meta, onDone) => {
  const response = await fetch(`${API_BASE_URL}/stream/process_message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ new_message: message, conversation_id: conversation_id }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let ai_meta = null;

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
                onMessage(parsedData.content);
                break;
              case 'user_meta':
                user_meta(parsedData);
                break;
              case 'ai_meta':
                ai_meta = parsedData;
                break;
              case 'done':
                onDone(ai_meta);
                break;
              case 'error':
                onMessage('\n');
                onMessage(parsedData.content);
                onDone(ai_meta);
                break;
              case 'codeblock':
                console.log('Received codeblock data:', parsedData);
                break;
              case 'start':
              case 'ping':
                break;
              default:
                console.log("unhandled!!");
                console.log(event);
                console.log(parsedData);
            }
          } catch (error) {
            console.warn('Error parsing JSON:', error);
            onMessage(error);
          }
          buffer = '';
        }
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

  if (buffer.trim() !== '') {
    processChunk(buffer);
  }
};

