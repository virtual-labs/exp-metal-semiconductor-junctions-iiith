// JavaScript for PN Junction Matching Exercise
document.addEventListener('DOMContentLoaded', function() {
    let selectedQuestion = null;
    let connections = [];
    let correctAnswers = {
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4"
    };
    let answersChecked = false;
  
    // Create a canvas element for drawing connection lines
    const container = document.querySelector('.container');
    const canvasElement = document.createElement('canvas');
    canvasElement.id = 'connectionCanvas';
    canvasElement.style.position = 'absolute';
    canvasElement.style.top = '0';
    canvasElement.style.left = '0';
    canvasElement.style.pointerEvents = 'none'; // Make sure canvas doesn't intercept clicks
    canvasElement.style.zIndex = '1'; // Place above content but below selections
    container.style.position = 'relative'; // Ensure container is a positioned element
    container.appendChild(canvasElement);
  
    // Add CSS styles for visual feedback
    const style = document.createElement('style');
    style.textContent = `
      .question, .answer {
        border: 2px solid transparent;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 8px;
        position: relative;
        z-index: 2;
      }
      .selected {
        border-color: blue;
        box-shadow: 0 0 5px rgba(0, 0, 255, 0.5);
      }
      .correct {
        border-color: green;
        background-color: rgba(0, 255, 0, 0.1);
      }
      .incorrect {
        border-color: red;
        background-color: rgba(255, 0, 0, 0.1);
      }
      .connected {
        border-color: orange;
      }
      .container {
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);
  
    // Function to resize canvas
    function resizeCanvas() {
      const canvas = document.getElementById('connectionCanvas');
      const containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
      redrawConnections();
    }
  
    // Listen for window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize canvas size
    setTimeout(resizeCanvas, 100); // Small delay to ensure DOM is fully rendered
  
    // Handle question selection
    document.querySelectorAll('.question').forEach(question => {
      question.addEventListener('click', function() {
        // Don't allow changes after answers are checked
        if (answersChecked) return;
        
        // Check if this question is already connected
        const existingConnection = connections.find(conn => conn.questionEl === this);
        
        if (existingConnection) {
          // Remove the existing connection
          removeConnection(existingConnection);
        }
        
        // Clear previous selection
        if (selectedQuestion) {
          selectedQuestion.classList.remove('selected');
        }
        
        // Select this question
        this.classList.add('selected');
        selectedQuestion = this;
      });
    });
  
    // Handle answer selection
    document.querySelectorAll('.answer').forEach(answer => {
      answer.addEventListener('click', function() {
        // Don't allow changes after answers are checked
        if (answersChecked) return;
        
        // Check if this answer is already connected
        const existingConnection = connections.find(conn => conn.answerEl === this);
        
        if (existingConnection) {
          // Remove the existing connection
          removeConnection(existingConnection);
        }
        
        // If a question is selected, connect it to this answer
        if (selectedQuestion) {
          connectItems(selectedQuestion, this);
          
          // Deselect question after connection
          selectedQuestion.classList.remove('selected');
          selectedQuestion = null;
        }
      });
    });
    
    // Function to remove a connection
    function removeConnection(connection) {
      // Remove connection from array
      connections = connections.filter(conn => conn !== connection);
      
      // Remove visual indications
      connection.questionEl.classList.remove('connected', 'correct', 'incorrect');
      connection.answerEl.classList.remove('connected', 'correct', 'incorrect');
      
      // Redraw remaining connections
      redrawConnections();
    }
    
    // Function to connect a question and answer
    function connectItems(question, answer) {
      // Store connection in the array
      connections.push({
        questionId: question.dataset.id,
        questionEl: question,
        answerId: answer.dataset.id,
        answerEl: answer
      });
      
      // Add connected class for visual feedback
      question.classList.add('connected');
      answer.classList.add('connected');
      
      // Redraw all connections
      redrawConnections();
    }
  
    // Function to draw connections
    function redrawConnections() {
      const canvas = document.getElementById('connectionCanvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const containerRect = container.getBoundingClientRect();
      
      connections.forEach(conn => {
        const questionRect = conn.questionEl.getBoundingClientRect();
        const answerRect = conn.answerEl.getBoundingClientRect();
        
        const startX = questionRect.left + questionRect.width / 2 - containerRect.left;
        const startY = questionRect.top + questionRect.height / 2 - containerRect.top;
        const endX = answerRect.left + answerRect.width / 2 - containerRect.left;
        const endY = answerRect.top + answerRect.height / 2 - containerRect.top;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        if (answersChecked) {
          if (correctAnswers[conn.questionId] === conn.answerId) {
            ctx.strokeStyle = 'green';
          } else {
            ctx.strokeStyle = 'red';
          }
        } else {
          ctx.strokeStyle = 'orange';
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
    document.getElementById('checkBtn').addEventListener('click', function() {
      let score = 0;
      answersChecked = true;
      
      connections.forEach(conn => {
        if (correctAnswers[conn.questionId] === conn.answerId) {
          conn.questionEl.classList.add('correct');
          conn.answerEl.classList.add('correct');
          conn.questionEl.classList.remove('connected');
          conn.answerEl.classList.remove('connected');
          score++;
        } else {
          conn.questionEl.classList.add('incorrect');
          conn.answerEl.classList.add('incorrect');
          conn.questionEl.classList.remove('connected');
          conn.answerEl.classList.remove('connected');
        }
      });
      
      redrawConnections();
      
      document.getElementById('score').textContent = 
        `Score: ${score} out of ${Object.keys(correctAnswers).length} correct`;
    });
  
    document.getElementById('resetBtn').addEventListener('click', function() {
      connections = [];
      answersChecked = false;
      
      if (selectedQuestion) {
        selectedQuestion.classList.remove('selected');
        selectedQuestion = null;
      }
      
      document.querySelectorAll('.question, .answer').forEach(el => {
        el.classList.remove('correct', 'incorrect', 'selected', 'connected');
      });
      
      const canvas = document.getElementById('connectionCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      document.getElementById('score').textContent = '';
    });
  });