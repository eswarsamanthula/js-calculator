// DOM Elements
const display = document.getElementById('display');
const historyList = document.getElementById('historyList');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const scientificToggle = document.getElementById('scientificToggle');
const scientificButtons = document.getElementById('scientificButtons');

// Calculator variables
let currentInput = '';
let calculationHistory = [];
let lastResult = null;

// Load saved data
function loadSavedData() {
  // Load dark mode preference
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  modeToggle.checked = isDarkMode;
  updateTheme(isDarkMode);
  
  // Load scientific mode preference
  const isScientific = localStorage.getItem('scientificMode') === 'true';
  scientificToggle.checked = isScientific;
  toggleScientificMode(isScientific);
  
  // Load calculation history
  const savedHistory = localStorage.getItem('calculationHistory');
  if (savedHistory) {
    calculationHistory = JSON.parse(savedHistory);
    updateHistoryDisplay();
  }
}

// Handle dark/light mode toggle
function updateTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    modeLabel.textContent = 'Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    modeLabel.textContent = 'Dark Mode';
  }
  localStorage.setItem('darkMode', isDark);
}

modeToggle.addEventListener('change', function() {
  updateTheme(this.checked);
});

// Handle scientific mode toggle
function toggleScientificMode(isScientific) {
  scientificButtons.style.display = isScientific ? 'grid' : 'none';
  localStorage.setItem('scientificMode', isScientific);
}

scientificToggle.addEventListener('change', function() {
  toggleScientificMode(this.checked);
});

// Basic calculator functions
function appendNumber(number) {
  if (currentInput === '0' && number !== '.') {
    currentInput = number;
  } else {
    currentInput += number;
  }
  display.textContent = currentInput;
}

function appendOperator(operator) {
  const lastChar = currentInput.slice(-1);
  if (['+', '-', '*', '/', '%', '**'].includes(lastChar)) {
    currentInput = currentInput.slice(0, -1) + operator;
  } else {
    currentInput += operator;
  }
  display.textContent = currentInput;
}

function clearDisplay() {
  currentInput = '';
  display.textContent = '0';
}

function backspace() {
  if (currentInput.length > 0) {
    currentInput = currentInput.slice(0, -1);
    display.textContent = currentInput || '0';
  }
}

function calculate() {
  if (!currentInput) return;
  
  try {
    // Save the expression for history
    const expression = currentInput;
    
    // Replace % with /100 for percentage calculations
    const processedInput = currentInput.replace(/%/g, '/100');
    
    // Evaluate the expression
    const result = eval(processedInput).toString();
    
    // Update display and currentInput
    display.textContent = result;
    currentInput = result;
    lastResult = result;
    
    // Add to history
    addToHistory(expression, result);
  } catch (e) {
    display.textContent = 'Error';
    currentInput = '';
  }
}

// Scientific calculator functions
function calculateFunction(func) {
  if (!currentInput && func !== 'pi') return;

  try {
    const number = parseFloat(currentInput);
    let result;
    let expression = '';

    switch (func) {
      case 'sqrt':
        result = Math.sqrt(number);
        expression = `√(${currentInput})`;
        break;
      case 'square':
        result = number * number;
        expression = `(${currentInput})²`;
        break;
      case 'cube':
        result = number * number * number;
        expression = `(${currentInput})³`;
        break;
      case '1/x':
        result = 1 / number;
        expression = `1/(${currentInput})`;
        break;
      case 'sin':
        result = Math.sin(number);
        expression = `sin(${currentInput})`;
        break;
      case 'cos':
        result = Math.cos(number);
        expression = `cos(${currentInput})`;
        break;
      case 'tan':
        result = Math.tan(number);
        expression = `tan(${currentInput})`;
        break;
      case 'log':
        result = Math.log10(number);
        expression = `log(${currentInput})`;
        break;
      case 'ln':
        result = Math.log(number);
        expression = `ln(${currentInput})`;
        break;
    }

    // Add to history and update display
    display.textContent = result;
    addToHistory(expression, result);
    currentInput = result.toString();
    lastResult = result;
  } catch (e) {
    display.textContent = 'Error';
    currentInput = '';
  }
}

// History functions
function addToHistory(expression, result) {
  calculationHistory.unshift({ expression, result });
  if (calculationHistory.length > 10) {
    calculationHistory.pop();
  }
  updateHistoryDisplay();
  saveHistory();
}

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  calculationHistory.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-expression">${item.expression}</div>
      <div class="history-result">${item.result}</div>
    `;
    historyItem.addEventListener('click', () => {
      currentInput = item.result;
      display.textContent = currentInput;
    });
    historyList.appendChild(historyItem);
  });
}

function clearHistory() {
  calculationHistory = [];
  updateHistoryDisplay();
  saveHistory();
}

function saveHistory() {
  localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
}

// Keyboard support
document.addEventListener('keydown', function(event) {
  const key = event.key;
  
  // Number keys
  if (/[0-9.]/.test(key)) {
    appendNumber(key);
  }
  // Operators
  else if (['+', '-', '*', '/'].includes(key)) {
    appendOperator(key);
  }
  // Equal sign and Enter key
  else if (key === '=' || key === 'Enter') {
    calculate();
    event.preventDefault(); // Prevent form submission if in a form
  }
  // Backspace
  else if (key === 'Backspace') {
    backspace();
  }
  // Escape key for clear
  else if (key === 'Escape') {
    clearDisplay();
  }
  // Percentage
  else if (key === '%') {
    appendOperator('%');
  }
  // Power
  else if (key === '^') {
    appendOperator('**');
  }
});

// Initialize
loadSavedData();