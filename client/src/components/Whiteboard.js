import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001'); // Ensure this matches your server URL

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set drawing styles
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Handle drawing events from other users
    socket.on('draw', (data) => {
      const { x, y, type } = data;
      if (type === 'start') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (type === 'draw') {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    return () => {
      socket.off('draw');
    };
  }, []);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    // Start a new path locally
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Emit to server
    socket.emit('draw', { x, y, type: 'start' });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return; // Only draw if mouse is pressed

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw locally
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();

    // Emit to server
    socket.emit('draw', { x, y, type: 'draw' });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop drawing if mouse leaves the canvas
    />
  );
};

export default Whiteboard;