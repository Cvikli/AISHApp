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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    let boundaryIndex;
    while ((boundaryIndex = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);

      if (chunk.trim() === '') continue;

      const [eventField, dataField] = chunk.split('\n');
      const [, event] = eventField.split(': ');
      const [, data] = dataField.split(': ');

      try {
        const parsedData = JSON.parse(data);
        switch (event) {
          case 'message':
            onMessage(parsedData.content);
            break;
          case 'done':
            onDone(parsedData.content);
            break;
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        // If JSON parsing fails, we'll just continue to the next chunk
      }
    }
  }

  // Handle any remaining data in the buffer
  if (buffer.trim() !== '') {
    console.warn('Unprocessed data in buffer:', buffer);
  }
};
