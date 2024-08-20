const API_BASE_URL = 'http://localhost:8002';

export const streamProcessMessage = async (message, onMessage, onInMeta, onDone) => {
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
  let outMeta = null;

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
              case 'in_meta':
                onInMeta(parsedData);
                break;
              case 'out_meta':
                outMeta = parsedData;
                break;
              case 'done':
                onDone(parsedData.content, outMeta);
                break;
            }
          } catch (error) {
            console.warn('Error parsing JSON:', error);
            if (event === 'message') {
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

  if (buffer.trim() !== '') {
    processChunk(buffer);
  }
};
