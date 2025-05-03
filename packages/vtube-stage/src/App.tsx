import { Canvas } from '@react-three/fiber';
import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VRMController } from './components/VRMController';
import { SceneContent } from './components/SceneContent';
import { StageCommand } from './types/command';
import { validateStageCommand } from './utils/command_validator';

// Define the structure for a single avatar's state
interface AvatarState {
  id: string;
  vrmUrl: string;
  animationUrls: Record<string, string>;
  expressionWeights: Record<string, number>;
  headYaw: number;
  currentAnimationName: string;
  position: [number, number, number]; // Add position
}

const WS_URL = 'ws://localhost:8000/ws'; // Make sure this matches your stage-director address

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<StageCommand | object | null>(null);

  // useRef to hold the WebSocket instance persistent across renders
  const ws = useRef<WebSocket | null>(null);

  // Function to initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Prevent multiple connections if already open or connecting
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      console.log(`WebSocket is already ${ws.current.readyState === WebSocket.OPEN ? 'connected' : 'connecting'}.`);
      return;
    }

    console.log(`Attempting to connect to WebSocket at ${WS_URL}...`);
    // Create a new WebSocket instance and store it locally for handler setup
    const newWs = new WebSocket(WS_URL);

    newWs.onopen = () => {
      console.log('WebSocket Connected');
      // Only update state if this is the current connection attempt
      if (ws.current === newWs) {
        setIsConnected(true);
        // Send using the instance associated with this onopen handler
        newWs.send('Hello from vtube-stage!');
      } else {
        // This might happen if a new connection was initiated before this one opened
        console.log('Received onopen for a stale WebSocket instance. Closing it.');
        newWs.close();
      }
    };

    newWs.onclose = event => {
      console.log(`WebSocket Disconnected: Code=${event.code}, Reason=${event.reason}`);
      // Only update state and clear the ref if the closed instance is the current one
      if (ws.current === newWs) {
        setIsConnected(false);
        ws.current = null; // Clear the ref
        // Optional: Implement reconnection logic here
        // console.log('Attempting to reconnect in 5 seconds...');
        // setTimeout(connectWebSocket, 5000);
      } else {
        console.log('Received onclose for a stale WebSocket instance.');
      }
    };

    newWs.onerror = error => {
      console.error('WebSocket Error:', error);
      // The onclose event will likely follow an error, no need to clear ref here usually
    };

    newWs.onmessage = async event => {
      // Make the handler async
      if (ws.current !== newWs) {
        console.log('Received message for a stale WebSocket instance.');
        return;
      }

      console.log('Raw message from server:', event.data);
      try {
        const parsedData = JSON.parse(event.data);

        // --- Replace type guard with validation ---
        const validationResult = await validateStageCommand(parsedData);

        if (validationResult.errors.length === 0 && validationResult.command) {
          // Validation successful, command is not null
          const command = validationResult.command;
          setLastMessage(command); // Store validated command object

          // Process command based on its type
          switch (command.command) {
            case 'setExpression':
              console.log(
                `Received setExpression: Character=${command.payload.characterId}, Name=${command.payload.expressionName}, Weight=${command.payload.weight}`
              );
              // --- Update the specific avatar's expression ---
              setAvatars(prevAvatars =>
                prevAvatars.map(a =>
                  a.id === command.payload.characterId
                    ? {
                        ...a,
                        expressionWeights: {
                          ...a.expressionWeights, // Keep existing weights
                          [command.payload.expressionName]: command.payload.weight, // Update specific expression
                        },
                      }
                    : a
                )
              );
              break;
            case 'logMessage':
              console.log(`Server log: ${command.payload.message}`);
              break;
            // Add cases for other commands like setPose, triggerAnimation later
            // case 'setPose':
            //    console.log(`Received setPose: Character=${command.payload.characterId}, Name=${command.payload.poseName}`);
            //    // --- TODO: Call VRM pose function for the specific avatar ---
            //    break;
            // case 'triggerAnimation':
            //    console.log(`Received triggerAnimation: Character=${command.payload.characterId}, Name=${command.payload.animationName}`);
            // --- TODO: Call VRM animation function for the specific avatar ---
            //    setAvatars(prevAvatars =>
            //      prevAvatars.map(a =>
            //        a.id === command.payload.characterId ? { ...a, currentAnimationName: command.payload.animationName } : a
            //      )
            //    );
            //    break;
            default:
              // This should ideally not happen if commandRegistry is exhaustive
              // and validation passes, but good for safety.
              // const _exhaustiveCheck: never = command; // Helps ensure all commands are handled
              console.warn(
                `Received unknown or unhandled command type after validation: ${'command' in command ? command.command : 'unknown'}`
              );
          }
        } else {
          // Validation failed
          console.warn('Received data failed validation:', validationResult.errors);
          // Store the original data and the errors
          setLastMessage({ error: 'Validation failed', errors: validationResult.errors, data: parsedData });
        }
      } catch (error) {
        console.error('Failed to parse message or unexpected error during validation:', error);
        setLastMessage({ error: 'Invalid JSON or processing error', data: event.data });
      }
    };

    // Assign the new instance to the ref *after* setting up handlers
    ws.current = newWs;
  }, []); // Empty dependency array

  useEffect(() => {
    connectWebSocket();

    // Cleanup function
    return () => {
      // Store the current ws instance before potential clearing in onclose
      const wsInstanceToClose = ws.current;
      // Clear the ref immediately on unmount intent
      ws.current = null;
      // Close the WebSocket instance if it exists
      if (wsInstanceToClose) {
        wsInstanceToClose.close();
        console.log('WebSocket connection closed on component unmount.');
      }
    };
  }, [connectWebSocket]);

  const sendTestMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = `Test message from client at ${new Date().toLocaleTimeString()}`;
      ws.current.send(message);
      console.log('Sent message:', message);
    } else {
      console.log('WebSocket is not connected. Cannot send message.');
    }
  };

  // State now holds an array of avatar states. Initialize with two avatars.
  const [avatars, setAvatars] = useState<AvatarState[]>([
    {
      id: 'avatar1',
      vrmUrl: '/avatar.vrm',
      animationUrls: { idle: '/idle.vrma', wave: '/wave.vrma' },
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: 'idle',
      position: [-0.5, 0, 0], // Position for first avatar
    },
    {
      id: 'avatar2',
      vrmUrl: '/avatar2.vrm', // Use avatar2.vrm
      animationUrls: { idle: '/idle.vrma', wave: '/wave.vrma' }, // Assuming same animations for now
      expressionWeights: { neutral: 0.1 },
      headYaw: 0,
      currentAnimationName: 'idle',
      position: [0.5, 0, 0], // Position for second avatar
    },
  ]);

  // --- Rendering ---
  return (
    <div id="app-container">
      {' '}
      {/* Changed ID for clarity */}
      <div id="canvas-container">
        <Canvas camera={{ position: [0, 1.2, 2.5], fov: 50 }} shadows>
          {/* Pass the entire avatars array to SceneContent */}
          <SceneContent avatars={avatars} />
        </Canvas>
      </div>
      {/* Controller UI Area */}
      <div className="controllers-area">
        <h3>Stage Controls & Status</h3>

        {/* Connection Status */}
        <div>
          <strong>Connection Status:</strong>{' '}
          <span style={{ color: isConnected ? 'green' : 'red' }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Last Received Message */}
        <div>
          <strong>Last Command from Server:</strong>
          {/* Display the parsed command object nicely */}
          <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {lastMessage ? JSON.stringify(lastMessage, null, 2) : 'N/A'}
          </pre>
        </div>

        {/* Test Button */}
        <button onClick={sendTestMessage} disabled={!isConnected}>
          Send Test Message to Server
        </button>

        {avatars.map(avatar => (
          <VRMController
            key={avatar.id} // Crucial for React to differentiate instances
            title={`Avatar ${avatar.id.replace('avatar', '')} Controls`} // Add a title
            // Define handlers directly here, ensuring they close over the correct 'avatar.id'
            onExpressionChange={(name, weight) => {
              setAvatars(prevAvatars =>
                prevAvatars.map(a =>
                  a.id === avatar.id
                    ? {
                        ...a,
                        expressionWeights: {
                          ...a.expressionWeights,
                          [name]: weight,
                        },
                      }
                    : a
                )
              );
            }}
            onHeadYawChange={angle => {
              setAvatars(prevAvatars => prevAvatars.map(a => (a.id === avatar.id ? { ...a, headYaw: angle } : a)));
            }}
            onAnimationChange={animationName => {
              setAvatars(prevAvatars =>
                prevAvatars.map(a => (a.id === avatar.id ? { ...a, currentAnimationName: animationName } : a))
              );
            }}
            availableAnimations={Object.keys(avatar.animationUrls)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
